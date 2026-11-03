import { allowedNextEventStatuses, isEventLifecycleStatus } from "../domain/event-lifecycle";

type BindValue = string | number | null;

export interface TransitionStatement {
  bind(...values: BindValue[]): TransitionStatement;
  first<T>(): Promise<T | null>;
}

export interface TransitionDatabase {
  prepare(sql: string): TransitionStatement;
  batch(statements: TransitionStatement[]): Promise<Array<{ meta?: { changes?: number } }>>;
}

export interface TransitionValidators {
  image(url: string): boolean;
  ticket(provider: string, url: string): boolean;
}

export type TransitionResult = "updated" | "invalid" | "not_found" | "conflict";

type EventRow = {
  slug: string;
  status: string;
  updated_at: string;
  image_url: string;
  ticket_provider: string;
  ticket_url: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Explicit, version-guarded lifecycle change; no draft can bypass the publish workflow. */
export async function transitionEventStatus(
  db: TransitionDatabase,
  actorId: string,
  eventId: string,
  expectedUpdatedAt: string,
  confirmationSlug: string,
  targetStatus: string,
  validators: TransitionValidators,
): Promise<TransitionResult> {
  if (!uuidPattern.test(eventId)) return "not_found";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 40 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(confirmationSlug) ||
      confirmationSlug.length > 120) return "invalid";

  const row = await db.prepare(`SELECT slug, status, updated_at, image_url,
    ticket_provider, ticket_url FROM events
    WHERE id = ? AND deleted_at IS NULL LIMIT 1`)
    .bind(eventId).first<EventRow>();

  if (!row) return "not_found";
  if (row.slug !== confirmationSlug) return "invalid";
  if (row.updated_at !== expectedUpdatedAt) return "conflict";
  if (!isEventLifecycleStatus(targetStatus) ||
      !allowedNextEventStatuses(row.status).includes(targetStatus)) return "invalid";

  // Reactivating sold-out tickets requires the same trusted links as initial publication.
  if (targetStatus === "published" &&
      (!validators.image(row.image_url) || !validators.ticket(row.ticket_provider, row.ticket_url))) {
    return "invalid";
  }

  const timestamp = new Date().toISOString();
  const now = timestamp === expectedUpdatedAt
    ? new Date(Date.parse(timestamp) + 1).toISOString()
    : timestamp;
  const before = JSON.stringify({ slug: row.slug, status: row.status });
  const after = JSON.stringify({ slug: row.slug, status: targetStatus });

  // Cloudflare D1 batch runs atomically. Both guards reject stale changes.
  const results = await db.batch([
    db.prepare(`INSERT INTO admin_audit_logs
      (id, actor_admin_id, action, entity_type, entity_id, before_json, after_json)
      SELECT ?, ?, 'event.status.change', 'event', id, ?, ?
      FROM events WHERE id = ? AND slug = ? AND status = ?
        AND updated_at = ? AND deleted_at IS NULL`)
      .bind(crypto.randomUUID(), actorId, before, after,
        eventId, confirmationSlug, row.status, expectedUpdatedAt),
    db.prepare(`UPDATE events SET status = ?, updated_at = ?
      WHERE id = ? AND slug = ? AND status = ?
        AND updated_at = ? AND deleted_at IS NULL`)
      .bind(targetStatus, now, eventId, confirmationSlug, row.status, expectedUpdatedAt),
  ]);

  return results[0]?.meta?.changes === 1 && results[1]?.meta?.changes === 1
    ? "updated"
    : "conflict";
}
