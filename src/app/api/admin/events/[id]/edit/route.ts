import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission } from "@/features/admin/domain/permissions";
import { MAX_DRAFT_FORM_BODY_BYTES, validateDraftEventForm, type DraftFieldErrors } from "@/features/admin/domain/parse-draft-event";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { editDraftEvent, type EditDraftResult, type EditDraftDatabase } from "@/features/admin/server/edit-draft-event";
import { isTrustedTicketUrl } from "@/features/events/domain/ticket-provider";

export const dynamic = "force-dynamic";

type Failure = Exclude<EditDraftResult, "updated">;
const statusCodes: Record<Failure, number> = { invalid: 422, not_found: 404, conflict: 409 };

function outcome(request: NextRequest, code: EditDraftResult, fields: DraftFieldErrors = {}) {
  const ok = code === "updated";
  const status = code === "updated" ? 200 : statusCodes[code];
  const redirect = ok ? "/admin/events?edited=1" : `/admin/events?edit_error=${code}`;

  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ ok, code, fields, redirect }, {
      status, headers: { "Cache-Control": "no-store" },
    });
  }
  const response = NextResponse.redirect(new URL(redirect, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Same-origin, authorized, optimistic draft-only edit; never modifies published events. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/x-www-form-urlencoded") {
    return new Response("Unsupported media type", { status: 415 });
  }
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > MAX_DRAFT_FORM_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { return new Response("Admin session unavailable", { status: 503 }); }
  if (!admin) return new Response("Unauthorized", { status: 401 });
  if (!hasAdminPermission(admin.role, "events.draft.edit")) {
    return new Response("Forbidden", { status: 403 });
  }

  let form: FormData;
  try { form = await request.formData(); }
  catch { return outcome(request, "invalid"); }

  const version = form.get("version");
  if (typeof version !== "string" || !version || version.length > 40) {
    return outcome(request, "invalid");
  }

  const validation = validateDraftEventForm(form);
  if (!validation.value) return outcome(request, "invalid", validation.errors);
  if (!isTrustedTicketUrl(validation.value.ticketProvider, validation.value.ticketUrl)) {
    return outcome(request, "invalid", {
      ticketUrl: "الرابط لا يطابق منصة التذاكر الرسمية المختارة.",
    });
  }

  const { id } = await context.params;
  try {
    return outcome(request, await editDraftEvent(
      getAdminDb() as unknown as EditDraftDatabase,
      admin.id, id, version, validation.value,
    ));
  } catch {
    return new Response("Draft edit unavailable", {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
