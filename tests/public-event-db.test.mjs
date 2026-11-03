import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { D1PublicEventRepository } from "../src/features/events/data/d1-public-event.repository.ts";

const migration = readFileSync(
  new URL("../migrations/0001_admin_foundation.sql", import.meta.url),
  "utf8"
);

function repository() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(migration);

  const insert = sqlite.prepare(`INSERT INTO events
    (id, slug, title_ar, image_url, category, city, venue,
     schedule_label, ticket_provider, ticket_url, status, featured, deleted_at)
    VALUES (?, ?, ?, 'https://images.unsplash.com/photo-test', 'music', ?,
      'قاعة الاختبار', 'قريباً', 'webook',
      'https://webook.com/ar/sa/experiences/sample', ?, ?, ?)`);

  insert.run("published-jed", "published-jed", "حفلة جدة", "jeddah", "published", 1, null);
  insert.run("published-ruh", "published-ruh", "حفلة الرياض", "riyadh", "published", 0, null);
  insert.run("draft-secret", "draft-secret", "مسودة سرية", "jeddah", "draft", 1, null);
  insert.run("deleted-secret", "deleted-secret", "محذوفة", "jeddah", "published", 1, "2026-11-01T00:00:00.000Z");

  const d1 = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
      };
    },
  };
  return { sqlite, repo: new D1PublicEventRepository(d1) };
}

test("all public reads filter drafts and soft-deleted events", async () => {
  const { sqlite, repo } = repository();
  try {
    assert.deepEqual((await repo.getAll()).map(({ slug }) => slug).sort(), ["published-jed", "published-ruh"]);
    assert.deepEqual((await repo.getPublished()).map(({ slug }) => slug).sort(), ["published-jed", "published-ruh"]);
    assert.deepEqual((await repo.getFeatured()).map(({ slug }) => slug), ["published-jed"]);
    assert.equal(await repo.getBySlug("draft-secret"), null);
    assert.equal(await repo.getBySlug("deleted-secret"), null);
    assert.equal(await repo.getBySlug("nonexistent"), null);
    assert.equal((await repo.getBySlug("published-jed"))?.status, "published");
  } finally { sqlite.close(); }
});

test("public search filters city, category, and title without leaking drafts", async () => {
  const { sqlite, repo } = repository();
  try {
    assert.deepEqual((await repo.searchPublished({ city: "Jeddah", category: "music" })).map(({ slug }) => slug), ["published-jed"]);
    assert.deepEqual((await repo.searchPublished({ search: "حفلة" })).map(({ slug }) => slug).sort(), ["published-jed", "published-ruh"]);
    assert.deepEqual(await repo.searchPublished({ search: "سرية" }), []);
    assert.deepEqual(await repo.searchPublished({ search: "%' OR 1=1 --" }), []);
    const found = await repo.getBySlug("published-jed");
    assert.equal(found?.location.city, "jeddah");
    assert.equal(found?.price.currency, "SAR");
    assert.equal(found?.startAt, undefined);
    assert.equal(found?.scheduleLabel, "قريباً");
  } finally { sqlite.close(); }
});
