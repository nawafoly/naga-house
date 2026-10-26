import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, googleAuthorization, oauthCookieName } from "@/features/admin/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { url, cookie } = await googleAuthorization(request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set(oauthCookieName(), cookie, {
      ...cookieOptions(request.url), maxAge: 600,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const notConfigured = error instanceof Error && error.message === "NAGA_AUTH_NOT_CONFIGURED";
    // Log only a fixed classification, never client secrets, cookies or OAuth parameters.
    console.error("NAGA_OAUTH_START:", notConfigured ? "CONFIG_MISSING" : "UNEXPECTED_ERROR");
    return NextResponse.redirect(new URL(`/admin/login?error=${notConfigured ? "config" : "server"}`, request.url));
  }
}
