import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { editLiveEvent } from "../src/features/admin/server/edit-live-event.ts";

const migration = readFileSync(new URL("../migrations/0001_admin_foundation.sql", import.meta.url), "utf8");

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
    (id, slug, title_ar, image_url, category, city, venue, schedule_label, ticket_provider, ticket_url, status, deleted_at)
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
    slug: "published-event", titleAr: "تحديث عنوان المنشورة", titleEn: "Updated event",
    descriptionAr: "وصف جديد", imageUrl: "https://images.unsplash.com/photo-test",
    category: "music", venue: "قاعة جديدة", startAt: null, scheduleLabel: "قريباً",
    amountFrom: 50, ticketProvider: "webook",
    ticketUrl: "https://webook.com/ar/sa/experiences/sample",
  };
  function version(name) {
    return sqlite.prepare("SELECT updated_at FROM events WHERE id = ?").get(ids[name]).updated_at;
  }
  function state(name) {
    return sqlite.prepare("SELECT status, title_ar, slug, updated_at FROM events WHERE id = ?").get(ids[name]);
  }
  function audit(name) {
    return sqlite.prepare("SELECT action, before_json, after_json FROM admin_audit_logs WHERE entity_id = ?").all(ids[name]);
  }
  return { sqlite, db, actor, ids, valid, version, state, audit };
}

test("editing a published event retains its status and slug, with a single audit", async () => {
  const { sqlite, db, actor, ids, valid, version, state, audit } = setup();
  try {
    const before = version("published");
    assert.equal(await editLiveEvent(db, actor, ids.published, before, "published-event", valid), "updated");
    assert.equal(state("published").title_ar, valid.titleAr);
    assert.equal(state("published").status, "published");
    assert.equal(state("published").slug, "published-event");
    assert.notEqual(state("published").updated_at, before);
    assert.equal(audit("published").length, 1);
    assert.equal(audit("published")[0].action, "event.live.edit");
    assert.equal(JSON.parse(audit("published")[0].after_json).titleAr, valid.titleAr);
    assert.equal(await editLiveEvent(db, actor, ids.published, before, "published-event", valid), "conflict");
    assert.equal(audit("published").length, 1);
  } finally { sqlite.close(); }
});

test("sold-out event edits retain sold-out status; state transitions stay separate", async () => {
  const { sqlite, db, actor, ids, valid, version, state } = setup();
  try {
    assert.equal(await editLiveEvent(db, actor, ids.sold_out, version("sold_out"),
      "sold-out-event", { ...valid, slug: "sold-out-event" }), "updated");
    assert.equal(state("sold_out").status, "sold_out");
  } finally { sqlite.close(); }
});

test("drafts, cancelled/ended, deleted, stale and wrong slugs never edit live", async () => {
  const { sqlite, db, actor, ids, valid, version, state, audit } = setup();
  try {
    for (const name of ["draft", "cancelled", "ended"]) {
      assert.equal(await editLiveEvent(db, actor, ids[name], version(name),
        name + "-event", { ...valid, slug: name + "-event" }), "conflict");
      assert.equal(audit(name).length, 0);
    }
    assert.equal(await editLiveEvent(db, actor, ids.deleted, version("deleted"),
      "deleted-event", valid), "not_found");
    assert.equal(await editLiveEvent(db, actor, "bad-id", version("published"),
      "published-event", valid), "not_found");
    assert.equal(await editLiveEvent(db, actor, ids.published, version("published"),
      "other-event", valid), "invalid");
    assert.equal(await editLiveEvent(db, actor, ids.published, "stale",
      "published-event", valid), "conflict");
    assert.equal(await editLiveEvent(db, actor, ids.published, version("published"),
      "published-event", { ...valid, slug: "another" }), "invalid");
    assert.equal(state("published").title_ar, "فعالية اختبار");
    assert.equal(audit("published").length, 0);
  } finally { sqlite.close(); }
});

test("failed live update rolls back its audit record", async () => {
  const { sqlite, db, actor, ids, valid, version, audit, state } = setup();
  try {
    sqlite.exec(`CREATE TRIGGER reject_edits BEFORE UPDATE OF title_ar ON events
      BEGIN SELECT RAISE(ABORT, 'blocked'); END`);
    await assert.rejects(
      editLiveEvent(db, actor, ids.published, version("published"), "published-event", valid),
      /blocked/
    );
    assert.equal(state("published").title_ar, "فعالية اختبار");
    assert.equal(audit("published").length, 0);
  } finally { sqlite.close(); }
});

test("live edit route requires publish privilege, same-origin POST, validators and noindex", () => {
  const route = readFileSync(new URL("../src/app/api/admin/events/[id]/live-edit/route.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/app/admin/events/[id]/live-edit/page.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../src/app/admin/events/new/DraftEventForm.tsx", import.meta.url), "utf8");
  assert.match(route, /getCurrentAdmin\(\)/);
  assert.match(route, /hasAdminPermission\(admin\.role, "events\.publish"\)/);
  assert.match(route, /request\.headers\.get\("origin"\)/);
  assert.match(route, /validateDraftEventForm/);
  assert.match(route, /isTrustedTicketUrl/);
  assert.match(page, /status IN \('published', 'sold_out'\) AND deleted_at IS NULL/);
  assert.match(page, /index: false/);
  assert.match(form, /name="confirmSlug"/);
  assert.doesNotMatch(route, /export async function GET/);
});
