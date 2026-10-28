import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, revokeSession, sessionCookieName } from "@/features/admin/server/auth";



export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    await revokeSession(request.cookies.get(sessionCookieName())?.value);
  } catch {
    return new Response("Logout unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(sessionCookieName(), "", { ...cookieOptions(request.url), maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
