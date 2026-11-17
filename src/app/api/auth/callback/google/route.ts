import { NextRequest, NextResponse } from "next/server";
import { adminSessionMaxAge, cookieOptions, createSessionForGoogle, oauthCookieName, sessionCookieName, verifiedGoogleProfile, type GoogleAuthFailureStage } from "@/features/admin/server/auth";



export async function GET(request: NextRequest) {
  const options = cookieOptions(request.url);
  const fail = (code: string) => {
    const response = NextResponse.redirect(new URL(`/admin/login?error=${code}`, request.url));
    response.cookies.set(oauthCookieName(), "", { ...options, maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  };

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state || request.nextUrl.searchParams.has("error")) {
    console.warn("NAGA_ADMIN_GOOGLE_AUTH: CALLBACK_CODE_OR_STATE_MISSING");
    return fail("google");
  }

  try {
    let failureStage: GoogleAuthFailureStage | undefined;
    const googleUser = await verifiedGoogleProfile(
      request.url, code, state, request.cookies.get(oauthCookieName())?.value,
      "/api/auth/callback/google", (stage) => { failureStage = stage; }
    );
    if (!googleUser) return fail(failureStage ? `google_${failureStage}` : "google");
    const token = await createSessionForGoogle(googleUser);
    if (!token) return fail("access");

    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(oauthCookieName(), "", { ...options, maxAge: 0 });
    response.cookies.set(sessionCookieName(), token, { ...options, maxAge: adminSessionMaxAge() });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    // Do not leak OAuth code, token, Google credentials, or database SQL in responses/logs.
    console.error("NAGA_ADMIN_GOOGLE_AUTH:", error instanceof Error && error.message === "NAGA_AUTH_NOT_CONFIGURED" ? "CONFIG_MISSING" : "CALLBACK_UNEXPECTED_ERROR");
    return fail(error instanceof Error && error.message === "NAGA_AUTH_NOT_CONFIGURED" ? "config" : "server");
  }
}
