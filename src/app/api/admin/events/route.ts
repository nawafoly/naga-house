import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getCurrentAdmin } from "@/features/admin/server/auth";
import { parseDraftEventForm } from "@/features/admin/domain/parse-draft-event";
import { isTrustedTicketUrl } from "@/features/events/domain/ticket-provider";

export const dynamic = "force-dynamic";

function fail(request: NextRequest, code: string) {
  const response = NextResponse.redirect(new URL(`/admin/events/new?error=${code}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Same-origin, authenticated HTML form. Always drafts; never writes to published catalog. */
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

  let input;
  try { input = parseDraftEventForm(await request.formData()); }
  catch { return fail(request, "invalid"); }
  if (!input || !isTrustedTicketUrl(input.ticketProvider, input.ticketUrl)) {
    return fail(request, "invalid");
  }

  try {
    const db = getAdminDb();
    const existing = await db.prepare("SELECT id FROM events WHERE slug = ? LIMIT 1")
      .bind(input.slug).first<{ id: string }>();
    if (existing) return fail(request, "duplicate");

    const eventId = crypto.randomUUID();
    const afterJson = JSON.stringify({ slug: input.slug, titleAr: input.titleAr, status: "draft" });
    // Cloudflare D1 batch commits both inserts atomically, or rolls both back.
    // Local interface in auth.ts exposes prepare only, so extend its type here.
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
    const response = NextResponse.redirect(new URL("/admin/events?created=1", request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    // Do not expose SQL messages, schema, cookies or other internals to the browser.
    return fail(request, "server");
  }
}
