import { NextRequest } from "next/server";
import { verifiedGoogleProfile, cookieOptions } from "@/features/admin/server/auth";
import {
  loginVisitorByGoogle, visitorCookieOptions, visitorOAuthCookieName, visitorSessionCookieName, visitorSessionMaxAge,
} from "@/features/visitors/server/auth";
import { visitorRedirect } from "@/features/visitors/server/form";

const CALLBACK = "/api/visitor/google/callback";

export async function GET(request: NextRequest) {
  const fail = (type: string) => {
    const response = visitorRedirect(request, `/login?error=${type}`);
    response.cookies.set(visitorOAuthCookieName(), "", { ...cookieOptions(request.url), maxAge: 0 });
    return response;
  };
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || request.nextUrl.searchParams.has("error")) return fail("google");
  try {
    const profile = await verifiedGoogleProfile(request.url, code, state, request.cookies.get(visitorOAuthCookieName())?.value, CALLBACK);
    if (!profile) return fail("google");
    const token = await loginVisitorByGoogle(profile);
    if (!token) return fail("conflict");
    const response = visitorRedirect(request, "/account");
    response.cookies.set(visitorOAuthCookieName(), "", { ...cookieOptions(request.url), maxAge: 0 });
    response.cookies.set(visitorSessionCookieName(), token, {
      ...visitorCookieOptions(request.url), maxAge: visitorSessionMaxAge(),
    });
    return response;
  } catch { return fail("server"); }
}
