import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { editDraftEvent, nextDraftEditVersion } from "../src/features/admin/server/edit-draft-event.ts";

const migration = readFileSync(new URL("../migrations/0001_admin_foundation.sql", import.meta.url), "utf8");

test("draft edit versions advance within the same millisecond or after clock skew", () => {
  const previous = "2026-11-04T11:16:08.070Z";
  assert.equal(nextDraftEditVersion(previous, previous), "2026-11-04T11:16:08.071Z");
  assert.equal(nextDraftEditVersion(previous, "2026-11-04T11:16:08.069Z"), "2026-11-04T11:16:08.071Z");
  assert.equal(nextDraftEditVersion(previous, "2026-11-04T11:16:08.072Z"), "2026-11-04T11:16:08.072Z");
});

function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec(migration);
  const actor = crypto.randomUUID();
  sqlite.prepare("INSERT INTO admin_users (id,google_sub,email,role) VALUES (?,?,?,'owner')")
    .run(actor, "google-sub", "owner@example.test");
  const eventId = crypto.randomUUID();
  sqlite.prepare(`INSERT INTO events
    (id, slug, title_ar, image_url, category, city, venue,
     schedule_label, ticket_provider, ticket_url, status)
    VALUES (?, 'draft-one', 'مسودة قديمة',
      'https://images.unsplash.com/photo-test', 'music', 'jeddah',
      'قاعة', 'قريبًا', 'webook',
      'https://webook.com/ar/sa/experiences/sample', 'draft')`).run(eventId);
  const previous = sqlite.prepare("SELECT updated_at FROM events WHERE id = ?").get(eventId).updated_at;

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
  const valid = {
    slug: "draft-one",
    titleAr: "مسودة جديدة",
    titleEn: "New Event",
    descriptionAr: "وصف جديد",
    imageUrl: "https://images.unsplash.com/photo-test",
    category: "music",
    venue: "قاعة جدة",
    startAt: null,
    scheduleLabel: "يعلن لاحقًا",
    amountFrom: 95,
    ticketProvider: "webook",
    ticketUrl: "https://webook.com/ar/sa/experiences/sample",
  };
  return { sqlite, db, actor, eventId, previous, valid };
}

test("editing a draft persists validated fields and one transaction audit", async () => {
  const { sqlite, db, actor, eventId, previous, valid } = setup();
  try {
    assert.equal(await editDraftEvent(db, actor, eventId, previous, valid), "updated");
    const row = sqlite.prepare("SELECT title_ar, description_ar, amount_from, status, updated_at FROM events WHERE id = ?").get(eventId);
    assert.equal(row.title_ar, valid.titleAr);
    assert.equal(row.description_ar, valid.descriptionAr);
    assert.equal(row.amount_from, 95);
    assert.equal(row.status, "draft");
    assert.notEqual(row.updated_at, previous);
    const logs = sqlite.prepare("SELECT action, before_json, after_json FROM admin_audit_logs WHERE entity_id = ?").all(eventId);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, "event.edit");
    assert.equal(JSON.parse(logs[0].after_json).titleAr, valid.titleAr);
    assert.equal(await editDraftEvent(db, actor, eventId, previous, valid), "conflict");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs").get().n, 1);
  } finally { sqlite.close(); }
});

test("stale edits, changed slugs, published or deleted events never mutate or audit", async () => {
  const { sqlite, db, actor, eventId, previous, valid } = setup();
  try {
    assert.equal(await editDraftEvent(db, actor, eventId, previous, { ...valid, slug: "other" }), "invalid");
    assert.equal(await editDraftEvent(db, actor, eventId, "stale", valid), "conflict");
    assert.equal(await editDraftEvent(db, actor, "malformed", previous, valid), "not_found");
    sqlite.prepare("UPDATE events SET status = 'published' WHERE id = ?").run(eventId);
    assert.equal(await editDraftEvent(db, actor, eventId, previous, valid), "conflict");
    sqlite.prepare("UPDATE events SET status = 'draft', deleted_at = '2026-01-01' WHERE id = ?").run(eventId);
    assert.equal(await editDraftEvent(db, actor, eventId, previous, valid), "not_found");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs").get().n, 0);
  } finally { sqlite.close(); }
});

test("failed update rolls back edit audit in the same transaction", async () => {
  const { sqlite, db, actor, eventId, previous, valid } = setup();
  try {
    sqlite.exec(`CREATE TRIGGER reject_edits BEFORE UPDATE OF title_ar ON events
      BEGIN SELECT RAISE(ABORT, 'blocked'); END`);
    await assert.rejects(editDraftEvent(db, actor, eventId, previous, valid), /blocked/);
    assert.equal(sqlite.prepare("SELECT title_ar FROM events WHERE id = ?").get(eventId).title_ar, "مسودة قديمة");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM admin_audit_logs").get().n, 0);
  } finally { sqlite.close(); }
});

test("edit and preview routes demand authentication, permissions, draft-only row and noindex", () => {
  const route = readFileSync(new URL("../src/app/api/admin/events/[id]/edit/route.ts", import.meta.url), "utf8");
  const preview = readFileSync(new URL("../src/app/admin/events/[id]/preview/page.tsx", import.meta.url), "utf8");
  assert.match(route, /getCurrentAdmin\(\)/);
  assert.match(route, /hasAdminPermission\(admin\.role, "events\.draft\.edit"\)/);
  assert.match(route, /request\.headers\.get\("origin"\)/);
  assert.match(route, /validateDraftEventForm/);
  assert.match(route, /isTrustedTicketUrl/);
  assert.match(preview, /getCurrentAdmin\(\)/);
  assert.match(preview, /hasAdminPermission\(admin\.role, "events\.view"\)/);
  assert.match(preview, /status = 'draft' AND deleted_at IS NULL/);
  assert.match(preview, /index:\s*false/);
  assert.doesNotMatch(preview, /getPublicEventService/);
  assert.match(preview, /<EventDetailsView event=\{event\} preview/);
  const publicPage = readFileSync(new URL("../src/app/events/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(publicPage, /<EventDetailsView event=\{event\}/);
  const component = readFileSync(new URL("../src/features/events/components/EventDetailsView.tsx", import.meta.url), "utf8");
  assert.match(component, /canBook && !preview/);
});
