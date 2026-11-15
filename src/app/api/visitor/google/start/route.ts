import { NextRequest, NextResponse } from "next/server";
import { googleAuthorization, cookieOptions } from "@/features/admin/server/auth";
import { visitorOAuthCookieName } from "@/features/visitors/server/auth";

const CALLBACK = "/api/visitor/google/callback";

export async function GET(request: NextRequest) {
  try {
    const { url, cookie } = await googleAuthorization(request.url, CALLBACK);
    const response = NextResponse.redirect(url);
    response.cookies.set(visitorOAuthCookieName(), cookie, { ...cookieOptions(request.url), maxAge: 600 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }
}
