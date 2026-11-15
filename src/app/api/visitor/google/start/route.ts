import { NextRequest, NextResponse } from "next/server";
import { googleAuthorization, cookieOptions } from "@/features/admin/server/auth";
import { visitorStateCookieName } from "@/features/visitors/server/google-auth";

const CALLBACK_PATH = "/api/visitor/google/callback";

export async function GET(request: NextRequest) {
  try {
    const { url, cookie } = await googleAuthorization(request.url, CALLBACK_PATH);
    const response = NextResponse.redirect(url);
    response.cookies.set(visitorStateCookieName(), cookie, { ...cookieOptions(request.url), maxAge: 600 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }
}
