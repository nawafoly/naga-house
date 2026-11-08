import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  return readFileSync(new URL("../" + path, import.meta.url), "utf8");
}

test("draft card preview is restricted to authenticated admins and excluded from indexing", () => {
  const page = source("src/app/admin/events/[id]/preview/page.tsx");

  assert.match(page, /getCurrentAdmin\(\)/);
  assert.match(page, /hasAdminPermission\(admin\.role, "events\.view"\)/);
  assert.match(page, /status = 'draft' AND deleted_at IS NULL/);
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(page, /getPublicEventService/);
  assert.match(page, /<EventCard event=\{event\} eager preview\s*\/>/);
  assert.match(page, /<EventDetailsView event=\{event\} preview\s*\/>/);
});

test("draft cards have no public detail link or booking action", () => {
  const card = source("src/features/events/components/EventCard.tsx");

  assert.match(card, /preview\?: boolean/);
  assert.match(card, /{preview \? \([\s\S]*?معاينة البطاقة فقط — غير منشورة[\s\S]*?\) : \(\s*<Link/);
  assert.match(card, /href=\{\x60\/events\/\$\{event\.slug\}\x60\}/);
  assert.match(card, /{preview && \(/);
  assert.match(card, /مسودة غير منشورة/);

  const home = source("src/app/page.tsx");
  const listing = source("src/app/events/page.tsx");
  assert.doesNotMatch(home, /<EventCard[^>]*\bpreview\b/);
  assert.doesNotMatch(listing, /<EventCard[^>]*\bpreview\b/);
});
