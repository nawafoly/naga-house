import { NextRequest } from "next/server";
import { visitorCookieOptions, visitorSessionCookieName, visitorSessionMaxAge, registerVisitor, consumeVisitorRateLimit } from "@/features/visitors/server/auth";
import { normalizeVisitorEmail } from "@/features/visitors/domain/password";
import { readVisitorForm, visitorFormOriginAllowed, visitorRedirect, visitorRequestIp } from "@/features/visitors/server/form";

export async function POST(request: NextRequest) {
  if (!visitorFormOriginAllowed(request)) return new Response("Forbidden", { status: 403 });
  const form = await readVisitorForm(request);
  if (!form) return visitorRedirect(request, "/signup?error=invalid");
  const email = normalizeVisitorEmail(form.get("email"));
  const password = form.get("password");
  if (!email || password !== form.get("confirmPassword")) return visitorRedirect(request, "/signup?error=invalid");
  try {
    const allowed = await consumeVisitorRateLimit(visitorRequestIp(request), email, "register");
    if (!allowed) return visitorRedirect(request, "/signup?error=limit");
    const token = await registerVisitor(form.get("name"), email, password);
    if (!token) return visitorRedirect(request, "/signup?error=invalid");
    const response = visitorRedirect(request, "/account?created=1");
    response.cookies.set(visitorSessionCookieName(), token, {
      ...visitorCookieOptions(request.url), maxAge: visitorSessionMaxAge(),
    });
    return response;
  } catch {
    // Unique email races and transient database failures must never expose SQL or secrets.
    return visitorRedirect(request, "/signup?error=server");
  }
}
