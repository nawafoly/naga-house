import { NextRequest, NextResponse } from "next/server";
import { cookieOptions } from "@/features/admin/server/auth";
import { revokeVisitorSession, visitorSessionCookieName } from "@/features/visitors/server/google-auth";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    await revokeVisitorSession(request.cookies.get(visitorSessionCookieName())?.value);
  } catch {
    return new Response("Logout unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(visitorSessionCookieName(), "", { ...cookieOptions(request.url), maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
