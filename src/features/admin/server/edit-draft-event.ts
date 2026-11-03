import type { DraftEventInput } from "../domain/parse-draft-event";

type BindValue = string | number | null;

export interface EditDraftStatement {
  bind(...values: BindValue[]): EditDraftStatement;
  first<T>(): Promise<T | null>;
}

export interface EditDraftDatabase {
  prepare(sql: string): EditDraftStatement;
  batch(statements: EditDraftStatement[]): Promise<Array<{ meta?: { changes?: number } }>>;
}

type DraftRow = {
  id: string;
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

export type EditDraftResult = "updated" | "not_found" | "conflict" | "invalid";

/** Only drafts are editable. The slug is immutable to preserve existing links. */
export async function editDraftEvent(
  db: EditDraftDatabase,
  actorId: string,
  eventId: string,
  expectedUpdatedAt: string,
  input: DraftEventInput,
): Promise<EditDraftResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(eventId)) {
    return "not_found";
  }
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 40) return "invalid";

  const row = await db.prepare(`SELECT id, slug, status, updated_at, title_ar, title_en,
    description_ar, image_url, category, venue, start_at, schedule_label,
    amount_from, ticket_provider, ticket_url
    FROM events WHERE id = ? AND deleted_at IS NULL LIMIT 1`)
    .bind(eventId).first<DraftRow>();

  if (!row) return "not_found";
  if (row.status !== "draft" || row.updated_at !== expectedUpdatedAt) return "conflict";
  if (row.slug !== input.slug) return "invalid";

  const before = JSON.stringify(row);
  const after = JSON.stringify({ ...input, status: "draft" });
  const now = new Date().toISOString();

  // D1 batch executes in one transaction. Both statements use the same
  // draft/version guard so a stale or concurrently published row cannot be edited.
  const results = await db.batch([
    db.prepare(`INSERT INTO admin_audit_logs
      (id, actor_admin_id, action, entity_type, entity_id, before_json, after_json)
      SELECT ?, ?, 'event.edit', 'event', id, ?, ?
      FROM events WHERE id = ? AND status = 'draft' AND deleted_at IS NULL AND updated_at = ?`)
      .bind(crypto.randomUUID(), actorId, before, after, eventId, expectedUpdatedAt),
    db.prepare(`UPDATE events SET
      title_ar = ?, title_en = ?, description_ar = ?, image_url = ?,
      category = ?, venue = ?, start_at = ?, schedule_label = ?,
      amount_from = ?, ticket_provider = ?, ticket_url = ?, updated_at = ?
      WHERE id = ? AND slug = ? AND status = 'draft'
        AND deleted_at IS NULL AND updated_at = ?`)
      .bind(
        input.titleAr, input.titleEn, input.descriptionAr, input.imageUrl,
        input.category, input.venue, input.startAt, input.scheduleLabel,
        input.amountFrom, input.ticketProvider, input.ticketUrl, now,
        eventId, input.slug, expectedUpdatedAt
      ),
  ]);

  return results[0]?.meta?.changes === 1 && results[1]?.meta?.changes === 1
    ? "updated"
    : "conflict";
}
