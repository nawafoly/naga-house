import { NextRequest, NextResponse } from "next/server";
import { verifiedGoogleProfile, cookieOptions } from "@/features/admin/server/auth";
import {
  sessionForVerifiedGoogleVisitor, visitorSessionCookieName, visitorSessionMaxAge, visitorStateCookieName,
} from "@/features/visitors/server/google-auth";

const CALLBACK_PATH = "/api/visitor/google/callback";

export async function GET(request: NextRequest) {
  const options = cookieOptions(request.url);
  const fail = (code: string) => {
    const response = NextResponse.redirect(new URL(`/login?error=${code}`, request.url));
    response.cookies.set(visitorStateCookieName(), "", { ...options, maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  };
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || request.nextUrl.searchParams.has("error")) return fail("google");
  try {
    const profile = await verifiedGoogleProfile(
      request.url, code, state, request.cookies.get(visitorStateCookieName())?.value, CALLBACK_PATH
    );
    if (!profile) return fail("google");
    const token = await sessionForVerifiedGoogleVisitor(profile);
    if (!token) return fail("access");
    const response = NextResponse.redirect(new URL("/account", request.url));
    response.cookies.set(visitorStateCookieName(), "", { ...options, maxAge: 0 });
    response.cookies.set(visitorSessionCookieName(), token, { ...options, maxAge: visitorSessionMaxAge() });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch { return fail("server"); }
}
