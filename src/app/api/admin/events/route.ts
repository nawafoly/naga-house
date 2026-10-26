import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { validateDraftEventForm, type DraftFieldErrors } from "@/features/admin/domain/parse-draft-event";
import { isTrustedTicketUrl } from "@/features/events/domain/ticket-provider";

export const dynamic = "force-dynamic";

function result(request: NextRequest, code: string, fields: DraftFieldErrors = {}, status = 422) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ ok: false, code, fields }, { status, headers: { "Cache-Control": "no-store" } });
  }
  const response = NextResponse.redirect(new URL(`/admin/events/new?error=${code}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Protected HTML submission. Invalid inputs return field errors without clearing the form. */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  if (!(request.headers.get("content-type") ?? "").startsWith("application/x-www-form-urlencoded")) {
    return new Response("Unsupported media type", { status: 415 });
  }
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 20_000) {
    return new Response("Payload too large", { status: 413 });
  }

  let admin;
  try { admin = await getCurrentAdmin(); }
  catch { return new Response("Admin session unavailable", { status: 503 }); }
  if (!admin) return new Response("Unauthorized", { status: 401 });

  let validation;
  try { validation = validateDraftEventForm(await request.formData()); }
  catch { return result(request, "invalid"); }
  if (!validation.value) return result(request, "invalid", validation.errors);
  const input = validation.value;
  if (!isTrustedTicketUrl(input.ticketProvider, input.ticketUrl)) {
    return result(request, "invalid", {
      ticketUrl: "الرابط لا يطابق منصة التذاكر المختارة، أو أنه رابط عام وليس صفحة فعالية محددة.",
    });
  }

  try {
    const db = getAdminDb();
    const existing = await db.prepare("SELECT id FROM events WHERE slug = ? LIMIT 1")
      .bind(input.slug).first<{ id: string }>();
    if (existing) return result(request, "duplicate", { slug: "المعرّف مستخدم سابقًا. اختر معرّفًا مختلفًا." }, 409);

    const eventId = crypto.randomUUID();
    const afterJson = JSON.stringify({ slug: input.slug, titleAr: input.titleAr, status: "draft" });
    const transactionalDb = db as typeof db & {
      batch(statements: Array<ReturnType<typeof db.prepare>>): Promise<unknown>;
    };
    await transactionalDb.batch([
      db.prepare(`INSERT INTO events (
        id, slug, title_ar, title_en, description_ar, image_url, category, city,
        venue, start_at, schedule_label, amount_from, ticket_provider, ticket_url,
        status, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'jeddah', ?, ?, ?, ?, ?, ?, 'draft', 0)`)
        .bind(eventId, input.slug, input.titleAr, input.titleEn, input.descriptionAr,
          input.imageUrl, input.category, input.venue, input.startAt,
          input.scheduleLabel, input.amountFrom, input.ticketProvider, input.ticketUrl),
      db.prepare(`INSERT INTO admin_audit_logs
        (id, actor_admin_id, action, entity_type, entity_id, after_json)
        VALUES (?, ?, 'event.create', 'event', ?, ?)`)
        .bind(crypto.randomUUID(), admin.id, eventId, afterJson),
    ]);
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ ok: true, redirect: "/admin/events?created=1" }, { headers: { "Cache-Control": "no-store" } });
    }
    const response = NextResponse.redirect(new URL("/admin/events?created=1", request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return result(request, "server", {}, 503);
  }
}
