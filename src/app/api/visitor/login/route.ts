import { NextRequest } from "next/server";
import { visitorCookieOptions, visitorSessionCookieName, visitorSessionMaxAge, loginVisitor, consumeVisitorRateLimit } from "@/features/visitors/server/auth";
import { normalizeVisitorEmail } from "@/features/visitors/domain/password";
import { readVisitorForm, visitorFormOriginAllowed, visitorRedirect, visitorRequestIp } from "@/features/visitors/server/form";

export async function POST(request: NextRequest) {
  if (!visitorFormOriginAllowed(request)) return new Response("Forbidden", { status: 403 });
  const form = await readVisitorForm(request);
  const email = form && normalizeVisitorEmail(form.get("email"));
  if (!email) return visitorRedirect(request, "/login?error=invalid");
  try {
    const allowed = await consumeVisitorRateLimit(visitorRequestIp(request), email, "login");
    if (!allowed) return visitorRedirect(request, "/login?error=limit");
    const token = await loginVisitor(email, form?.get("password"));
    if (!token) return visitorRedirect(request, "/login?error=invalid");
    const response = visitorRedirect(request, "/account");
    response.cookies.set(visitorSessionCookieName(), token, {
      ...visitorCookieOptions(request.url), maxAge: visitorSessionMaxAge(),
    });
    return response;
  } catch {
    return visitorRedirect(request, "/login?error=server");
  }
}
