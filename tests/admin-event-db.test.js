import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migrationPath =
  process.env.NAGA_MIGRATION_PATH ??
  new URL("../migrations/0001_admin_foundation.sql", import.meta.url);
const eventRoutePath =
  process.env.NAGA_EVENT_ROUTE_PATH ??
  new URL("../src/app/api/admin/events/route.ts", import.meta.url);

const migration = readFileSync(migrationPath, "utf8");
const eventRoute = readFileSync(eventRoutePath, "utf8");

function database() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(migration);
  return db;
}

function extractInsert(table) {
  const pattern = new RegExp("`(INSERT INTO " + table + "[\\s\\S]*?)`", "g");
  const matches = [...eventRoute.matchAll(pattern)];
  assert.equal(matches.length, 1, `Expected exactly one INSERT for ${table}`);
  return matches[0][1];
}

test("admin migration creates the required tables and event category column", () => {
  const db = database();
  try {
    const names = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('admin_users', 'admin_sessions', 'events', 'media_assets', 'admin_audit_logs') ORDER BY name"
      )
      .all()
      .map(({ name }) => name);
    assert.deepEqual(names, [
      "admin_audit_logs",
      "admin_sessions",
      "admin_users",
      "events",
      "media_assets",
    ]);

    const columns = db.prepare("PRAGMA table_info(events)").all();
    const category = columns.find(({ name }) => name === "category");
    assert.ok(category, "events.category must exist");
    assert.equal(category.notnull, 1);

    const indexes = db.prepare("PRAGMA index_list(events)").all();
    assert.ok(indexes.some(({ name }) => name === "idx_events_category"));
  } finally {
    db.close();
  }
});

test("draft INSERT matches SQL parameters and saves event data", () => {
  const db = database();
  try {
    const insert = extractInsert("events");
    const bindSection = eventRoute
      .slice(eventRoute.indexOf("`INSERT INTO events"))
      .match(/`\s*\)\.bind\(([\s\S]*?)\n\s*\),/);
    assert.ok(bindSection, "events INSERT must be followed by .bind(...) values");
    const sourceBoundCount =
      (bindSection[1].match(/\b(?:eventId|input\.[A-Za-z]+)\b/g) ?? []).length;
    const values = [
      "event-1",
      "sample-event",
      "فعالية اختبار",
      null,
      null,
      "https://images.unsplash.com/photo-test",
      "music",
      "موقع تجريبي في جدة",
      null,
      "يحدد لاحقًا",
      null,
      "webook",
      "https://webook.com/events/sample-event",
    ];

    assert.equal((insert.match(/\?/g) ?? []).length, values.length);
    assert.equal(sourceBoundCount, values.length, "route.ts must bind one value per placeholder");
    db.prepare(insert).run(...values);

    const saved = db
      .prepare("SELECT slug, category, city, status, featured FROM events WHERE id = ?")
      .get("event-1");
    assert.deepEqual({ ...saved }, {
      slug: "sample-event",
      category: "music",
      city: "jeddah",
      status: "draft",
      featured: 0,
    });

    const invalid = [...values];
    invalid[0] = "event-2";
    invalid[1] = "invalid-category";
    invalid[6] = " ";
    assert.throws(() => db.prepare(insert).run(...invalid));
  } finally {
    db.close();
  }
});

test("audit INSERT is valid and admin sessions enforce foreign keys", () => {
  const db = database();
  try {
    const insert = extractInsert("admin_audit_logs");
    db.prepare(insert).run(
      "audit-1",
      null,
      "event-1",
      JSON.stringify({ status: "draft" })
    );
    const row = db
      .prepare("SELECT action, entity_type, entity_id FROM admin_audit_logs WHERE id = ?")
      .get("audit-1");
    assert.deepEqual({ ...row }, {
      action: "event.create",
      entity_type: "event",
      entity_id: "event-1",
    });

    assert.throws(() =>
      db
        .prepare(
          "INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
        )
        .run("session-1", "missing-admin", "hash-1", "2099-01-01T00:00:00.000Z")
    );
  } finally {
    db.close();
  }
});
