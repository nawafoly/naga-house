import { NextRequest } from "next/server";
import { revokeVisitorSession, visitorCookieOptions, visitorSessionCookieName } from "@/features/visitors/server/auth";
import { visitorRedirect } from "@/features/visitors/server/form";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  try {
    await revokeVisitorSession(request.cookies.get(visitorSessionCookieName())?.value);
  } catch {
    return new Response("Session unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const response = visitorRedirect(request, "/login");
  response.cookies.set(visitorSessionCookieName(), "", { ...visitorCookieOptions(request.url), maxAge: 0 });
  return response;
}
