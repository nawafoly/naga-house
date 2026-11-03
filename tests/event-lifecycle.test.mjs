import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { transitionEventStatus } from "../src/features/admin/server/transition-event.ts";
import { allowedNextEventStatuses } from "../src/features/admin/domain/event-lifecycle.ts";

const migration = readFileSync(new URL("../migrations/0001_admin_foundation.sql", import.meta.url), "utf8");
const validators = {
  image: (value) => value.startsWith("https://images.unsplash.com/"),
  ticket: (provider, value) => provider === "webook" && value.startsWith("https://webook.com/"),
};

function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec(migration);
  const actor = crypto.randomUUID();
  sqlite.prepare("INSERT INTO admin_users (id, google_sub, email, role) VALUES (?, ?, ?, 'owner')")
    .run(actor, "google-sub", "owner@example.test");

  const ids = Object.fromEntries(
    ["draft", "published", "sold_out", "cancelled", "ended", "deleted"].map((status) => [status, crypto.randomUUID()])
  );
  const insert = sqlite.prepare(`INSERT INTO events
    (id, slug, title_ar, image_url, category, city, venue,
     schedule_label, ticket_provider, ticket_url, status, deleted_at)
    VALUES (?, ?, 'فعالية اختبار', 'https://images.unsplash.com/photo-test',
      'music', 'jeddah', 'قاعة', 'قريباً', 'webook',
      'https://webook.com/ar/sa/experiences/sample', ?, ?)`);
  for (const [status, id] of Object.entries(ids)) {
    insert.run(id, status.replaceAll("_", "-") + "-event", status === "deleted" ? "published" : status,
      status === "deleted" ? "2026-11-01T00:00:00Z" : null);
  }

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
        const result = statements.map((stmt) => ({ meta: { changes: stmt.run().changes } }));
        sqlite.exec("COMMIT");
        return result;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  function version(status) {
    return sqlite.prepare("SELECT updated_at FROM events WHERE id = ?").get(ids[status]).updated_at;
  }
  function state(status) {
    return sqlite.prepare("SELECT status FROM events WHERE id = ?").get(ids[status]).status;
  }
  function audit(id) {
    return sqlite.prepare("SELECT action, before_json, after_json FROM admin_audit_logs WHERE entity_id = ?").all(id);
  }
  return { sqlite, db, ids, actor, version, state, audit };
}

test("only documented transitions are available; drafts can never bypass publish validation", () => {
  assert.deepEqual(allowedNextEventStatuses("draft"), []);
  assert.deepEqual(allowedNextEventStatuses("published"), ["sold_out", "cancelled", "ended", "draft"]);
  assert.deepEqual(allowedNextEventStatuses("sold_out"), ["published", "cancelled", "ended", "draft"]);
  assert.deepEqual(allowedNextEventStatuses("cancelled"), ["draft"]);
  assert.deepEqual(allowedNextEventStatuses("ended"), ["draft"]);
  assert.deepEqual(allowedNextEventStatuses("__proto__"), []);
});

test("published to sold-out status changes atomically, logs actor and rejects stale retry", async () => {
  const { sqlite, db, actor, ids, version, state, audit } = setup();
  try {
    const before = version("published");
    assert.equal(await transitionEventStatus(
      db, actor, ids.published, before, "published-event", "sold_out", validators,
    ), "updated");
    assert.equal(state("published"), "sold_out");
    assert.notEqual(version("published"), before);
    const logs = audit(ids.published);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, "event.status.change");
    assert.equal(JSON.parse(logs[0].before_json).status, "published");
    assert.equal(JSON.parse(logs[0].after_json).status, "sold_out");
    assert.equal(await transitionEventStatus(
      db, actor, ids.published, before, "published-event", "cancelled", validators,
    ), "conflict");
    assert.equal(audit(ids.published).length, 1);
  } finally { sqlite.close(); }
});

test("sold-out can reactivate only with a verified ticket and image", async () => {
  const { sqlite, db, actor, ids, version, state, audit } = setup();
  try {
    const before = version("sold_out");
    const reject = { ticket: () => false, image: validators.image };
    assert.equal(await transitionEventStatus(
      db, actor, ids.sold_out, before, "sold-out-event", "published", reject,
    ), "invalid");
    assert.equal(state("sold_out"), "sold_out");
    assert.equal(audit(ids.sold_out).length, 0);
    assert.equal(await transitionEventStatus(
      db, actor, ids.sold_out, before, "sold-out-event", "published", validators,
    ), "updated");
    assert.equal(state("sold_out"), "published");
  } finally { sqlite.close(); }
});

test("cancelled or ended must return to draft; no unexpected edits or audit", async () => {
  const { sqlite, db, actor, ids, version, state, audit } = setup();
  try {
    assert.equal(await transitionEventStatus(
      db, actor, ids.cancelled, version("cancelled"), "cancelled-event", "published", validators,
    ), "invalid");
    assert.equal(await transitionEventStatus(
      db, actor, ids.ended, version("ended"), "ended-event", "sold_out", validators,
    ), "invalid");
    assert.equal(await transitionEventStatus(
      db, actor, ids.draft, version("draft"), "draft-event", "published", validators,
    ), "invalid");
    assert.equal(await transitionEventStatus(
      db, actor, ids.cancelled, version("cancelled"), "cancelled-event", "draft", validators,
    ), "updated");
    assert.equal(state("cancelled"), "draft");
    assert.equal(audit(ids.cancelled).length, 1);
    assert.equal(audit(ids.ended).length, 0);
    assert.equal(audit(ids.draft).length, 0);
  } finally { sqlite.close(); }
});

test("deleted, unknown, malformed or incorrectly confirmed rows never change status", async () => {
  const { sqlite, db, actor, ids, version, audit } = setup();
  try {
    assert.equal(await transitionEventStatus(db, actor, ids.deleted,
      version("deleted"), "deleted-event", "draft", validators), "not_found");
    assert.equal(await transitionEventStatus(db, actor, "bad-id",
      version("published"), "published-event", "draft", validators), "not_found");
    assert.equal(await transitionEventStatus(db, actor, ids.published,
      version("published"), "wrong-slug", "draft", validators), "invalid");
    assert.equal(await transitionEventStatus(db, actor, ids.published,
      version("published"), "published-event", "draft ", validators), "invalid");
    assert.equal(await transitionEventStatus(db, actor, ids.published,
      "stale-version", "published-event", "draft", validators), "conflict");
    assert.equal(audit(ids.deleted).length, 0);
    assert.equal(audit(ids.published).length, 0);
  } finally { sqlite.close(); }
});

test("an aborted status update rolls back its audit record", async () => {
  const { sqlite, db, actor, ids, version, state, audit } = setup();
  try {
    sqlite.exec(`CREATE TRIGGER reject_status BEFORE UPDATE OF status ON events
      BEGIN SELECT RAISE(ABORT, 'blocked'); END`);
    await assert.rejects(
      transitionEventStatus(db, actor, ids.published,
        version("published"), "published-event", "sold_out", validators),
      /blocked/
    );
    assert.equal(state("published"), "published");
    assert.equal(audit(ids.published).length, 0);
  } finally { sqlite.close(); }
});

test("status route requires same-origin session and server permission", () => {
  const route = readFileSync(new URL("../src/app/api/admin/events/[id]/status/route.ts", import.meta.url), "utf8");
  const publicRepo = readFileSync(new URL("../src/features/events/data/d1-public-event.repository.ts", import.meta.url), "utf8");
  const view = readFileSync(new URL("../src/features/events/components/EventDetailsView.tsx", import.meta.url), "utf8");
  assert.match(route, /request\.headers\.get\("origin"\)/);
  assert.match(route, /getCurrentAdmin\(\)/);
  assert.match(route, /hasAdminPermission\(admin\.role, "events\.publish"\)/);
  assert.match(route, /targetStatus/);
  assert.doesNotMatch(route, /export async function GET/);
  assert.match(publicRepo, /publicDetailWhere/);
  assert.match(publicRepo, /status IN \('published', 'sold_out', 'cancelled', 'ended'\)/);
  assert.match(view, /event\.status === "published"/);
  assert.match(view, /eventStatusNotice\[event\.status\]/);
});
