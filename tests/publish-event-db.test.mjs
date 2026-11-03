import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { publishDraftEvent } from "../src/features/admin/server/publish-event.ts";

const migration = readFileSync(new URL("../migrations/0001_admin_foundation.sql", import.meta.url), "utf8");
const actor = crypto.randomUUID();

const validators = {
  image: (value) => value.startsWith("https://images.unsplash.com/"),
  ticket: (provider, value) => provider === "webook" && value.startsWith("https://webook.com/"),
};

function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec(migration);
  sqlite.prepare("INSERT INTO admin_users (id,google_sub,email,role) VALUES (?,?,?,'owner')")
    .run(actor, "google-sub", "owner@example.test");
  const insert = sqlite.prepare(`INSERT INTO events (
    id, slug, title_ar, image_url, category, city, venue,
    schedule_label, ticket_provider, ticket_url, status, deleted_at)
    VALUES (?, ?, 'فعالية اختبار', 'https://images.unsplash.com/photo-test',
      'music', 'jeddah', 'موقع جدة', 'قريبًا', 'webook',
      'https://webook.com/ar/sa/experiences/sample', ?, ?)`);

  const ids = {
    draft: crypto.randomUUID(),
    published: crypto.randomUUID(),
    deleted: crypto.randomUUID(),
    invalid: crypto.randomUUID(),
  };
  insert.run(ids.draft, "test-draft", "draft", null);
  insert.run(ids.published, "already-published", "published", null);
  insert.run(ids.deleted, "deleted-draft", "draft", "2026-11-01T00:00:00.000Z");
  insert.run(ids.invalid, "invalid-draft", "draft", null);
  sqlite.prepare("UPDATE events SET ticket_url = ? WHERE id = ?")
    .run("https://not-the-provider.test/event/one", ids.invalid);

  const db = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        run() { return sqlite.prepare(sql).run(...values); },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((stmt) => ({ meta: { changes: stmt.run().changes } }));
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { sqlite, db, ids };
}

test("publishing a validated draft updates status and writes exactly one audit entry", async () => {
  const { sqlite, db, ids } = setup();
  try {
    assert.equal(await publishDraftEvent(db, actor, ids.draft, "test-draft", validators), "published");
    const row = sqlite.prepare("SELECT status, published_at FROM events WHERE id = ?").get(ids.draft);
    assert.equal(row.status, "published");
    assert.ok(row.published_at);
    const audit = sqlite.prepare("SELECT action, before_json, after_json FROM admin_audit_logs WHERE entity_id = ?").all(ids.draft);
    assert.equal(audit.length, 1);
    assert.equal(audit[0].action, "event.publish");
    assert.equal(JSON.parse(audit[0].before_json).status, "draft");
    assert.equal(JSON.parse(audit[0].after_json).status, "published");
    assert.equal(await publishDraftEvent(db, actor, ids.draft, "test-draft", validators), "conflict");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs WHERE entity_id = ?").get(ids.draft).n, 1);
  } finally { sqlite.close(); }
});

test("wrong confirmation, unpublished or deleted rows and untrusted links cannot publish", async () => {
  const { sqlite, db, ids } = setup();
  try {
    assert.equal(await publishDraftEvent(db, actor, ids.draft, "another-slug", validators), "invalid");
    assert.equal(await publishDraftEvent(db, actor, ids.published, "already-published", validators), "conflict");
    assert.equal(await publishDraftEvent(db, actor, ids.deleted, "deleted-draft", validators), "not_found");
    assert.equal(await publishDraftEvent(db, actor, ids.invalid, "invalid-draft", validators), "invalid");
    assert.equal(await publishDraftEvent(db, actor, crypto.randomUUID(), "missing", validators), "not_found");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs").get().n, 0);
    assert.equal(sqlite.prepare("SELECT status FROM events WHERE id = ?").get(ids.draft).status, "draft");
  } finally { sqlite.close(); }
});

test("publish endpoint requires same-origin, admin session and server-side permission", () => {
  const route = readFileSync(new URL("../src/app/api/admin/events/[id]/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /request\.headers\.get\("origin"\)/);
  assert.match(route, /getCurrentAdmin\(\)/);
  assert.match(route, /hasAdminPermission\(admin\.role, "events\.publish"\)/);
  assert.match(route, /isTrustedTicketUrl/);
  assert.match(route, /isTrustedUnsplashImageUrl/);
  assert.match(route, /publishDraftEvent\(/);
  assert.doesNotMatch(route, /export async function GET/);
});

test("failed event update rolls back the publication audit in the same D1 batch", async () => {
  const { sqlite, db, ids } = setup();
  try {
    sqlite.exec(`CREATE TRIGGER reject_publish BEFORE UPDATE OF status ON events
      WHEN NEW.status = 'published' BEGIN SELECT RAISE(ABORT, 'blocked'); END`);
    await assert.rejects(
      publishDraftEvent(db, actor, ids.draft, "test-draft", validators),
      /blocked/
    );
    assert.equal(sqlite.prepare("SELECT status FROM events WHERE id = ?").get(ids.draft).status, "draft");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs").get().n, 0);
  } finally { sqlite.close(); }
});
