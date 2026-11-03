type BindValue = string | number | null;

export interface PublishStatement {
  bind(...values: BindValue[]): PublishStatement;
  first<T>(): Promise<T | null>;
}

export interface PublishDatabase {
  prepare(sql: string): PublishStatement;
  batch(statements: PublishStatement[]): Promise<Array<{ meta?: { changes?: number } }>>;
}

type PublishableRow = {
  id: string;
  slug: string;
  status: string;
  title_ar: string;
  city: string;
  venue: string;
  category: string;
  image_url: string;
  ticket_provider: string;
  ticket_url: string;
  start_at: string | null;
  schedule_label: string | null;
};

export type PublishResult = "published" | "not_found" | "conflict" | "invalid";

export interface PublishValidators {
  ticket(provider: string, url: string): boolean;
  image(url: string): boolean;
}

/** Perform a guarded draft -> published transition with a transactional audit log. */
export async function publishDraftEvent(
  db: PublishDatabase,
  actorId: string,
  eventId: string,
  confirmationSlug: string,
  validators: PublishValidators,
): Promise<PublishResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(eventId)) {
    return "not_found";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(confirmationSlug) || confirmationSlug.length > 120) {
    return "invalid";
  }

  const row = await db.prepare(`SELECT id, slug, status, title_ar, city, venue,
    category, image_url, ticket_provider, ticket_url, start_at, schedule_label
    FROM events WHERE id = ? AND deleted_at IS NULL LIMIT 1`)
    .bind(eventId).first<PublishableRow>();

  if (!row) return "not_found";
  if (row.status !== "draft") return "conflict";
  if (row.slug !== confirmationSlug) return "invalid";

  if (
    !row.title_ar.trim() || !row.venue.trim() ||
    row.city.toLowerCase() !== "jeddah" || !row.category.trim() ||
    (!row.start_at && !row.schedule_label?.trim()) ||
    !validators.image(row.image_url) ||
    !validators.ticket(row.ticket_provider, row.ticket_url)
  ) return "invalid";

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const before = JSON.stringify({ slug: row.slug, status: "draft" });
  const after = JSON.stringify({ slug: row.slug, status: "published", publishedAt: now });

  // D1 batch is one transaction. Insert the audit record only while the row
  // is still draft; this also avoids a duplicate audit on concurrent attempts.
  const results = await db.batch([
    db.prepare(`INSERT INTO admin_audit_logs
      (id, actor_admin_id, action, entity_type, entity_id, before_json, after_json)
      SELECT ?, ?, 'event.publish', 'event', id, ?, ?
      FROM events WHERE id = ? AND slug = ? AND status = 'draft' AND deleted_at IS NULL`)
      .bind(auditId, actorId, before, after, eventId, confirmationSlug),
    db.prepare(`UPDATE events SET status = 'published', published_at = ?, updated_at = ?
      WHERE id = ? AND slug = ? AND status = 'draft' AND deleted_at IS NULL`)
      .bind(now, now, eventId, confirmationSlug),
  ]);

  if (results[0]?.meta?.changes === 1 && results[1]?.meta?.changes === 1) {
    return "published";
  }
  return "conflict";
}
