import type { DraftEventInput } from "../domain/parse-draft-event";

type BindValue = string | number | null;

export interface EditLiveStatement {
  bind(...values: BindValue[]): EditLiveStatement;
  first<T>(): Promise<T | null>;
}

export interface EditLiveDatabase {
  prepare(sql: string): EditLiveStatement;
  batch(statements: EditLiveStatement[]): Promise<Array<{ meta?: { changes?: number } }>>;
}

type LiveRow = {
  slug: string;
  status: string;
  updated_at: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  image_url: string;
  category: string;
  venue: string;
  start_at: string | null;
  schedule_label: string | null;
  amount_from: number | null;
  ticket_provider: string;
  ticket_url: string;
};

export type EditLiveResult = "updated" | "invalid" | "not_found" | "conflict";

/** Authorized live edits never change status, event ID or public slug. */
export async function editLiveEvent(
  db: EditLiveDatabase,
  actorId: string,
  eventId: string,
  expectedUpdatedAt: string,
  confirmationSlug: string,
  input: DraftEventInput,
): Promise<EditLiveResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(eventId)) return "not_found";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 40 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(confirmationSlug) ||
      confirmationSlug.length > 120) return "invalid";

  const row = await db.prepare(`SELECT slug, status, updated_at, title_ar, title_en,
    description_ar, image_url, category, venue, start_at, schedule_label,
    amount_from, ticket_provider, ticket_url
    FROM events WHERE id = ? AND deleted_at IS NULL LIMIT 1`)
    .bind(eventId).first<LiveRow>();

  if (!row) return "not_found";
  if (row.status !== "published" && row.status !== "sold_out") return "conflict";
  if (row.updated_at !== expectedUpdatedAt) return "conflict";
  if (row.slug !== input.slug || row.slug !== confirmationSlug) return "invalid";

  const timestamp = new Date().toISOString();
  const now = timestamp === expectedUpdatedAt
    ? new Date(Date.parse(timestamp) + 1).toISOString()
    : timestamp;
  const before = JSON.stringify(row);
  const after = JSON.stringify({ ...input, status: row.status });
  const results = await db.batch([
    db.prepare(`INSERT INTO admin_audit_logs
      (id, actor_admin_id, action, entity_type, entity_id, before_json, after_json)
      SELECT ?, ?, 'event.live.edit', 'event', id, ?, ?
      FROM events WHERE id = ? AND slug = ? AND status = ?
        AND updated_at = ? AND deleted_at IS NULL`)
      .bind(crypto.randomUUID(), actorId, before, after,
        eventId, row.slug, row.status, expectedUpdatedAt),
    db.prepare(`UPDATE events SET
      title_ar = ?, title_en = ?, description_ar = ?, image_url = ?,
      category = ?, venue = ?, start_at = ?, schedule_label = ?,
      amount_from = ?, ticket_provider = ?, ticket_url = ?, updated_at = ?
      WHERE id = ? AND slug = ? AND status = ?
        AND updated_at = ? AND deleted_at IS NULL`)
      .bind(input.titleAr, input.titleEn, input.descriptionAr, input.imageUrl,
        input.category, input.venue, input.startAt, input.scheduleLabel,
        input.amountFrom, input.ticketProvider, input.ticketUrl, now,
        eventId, row.slug, row.status, expectedUpdatedAt),
  ]);

  return results[0]?.meta?.changes === 1 && results[1]?.meta?.changes === 1
    ? "updated" : "conflict";
}
