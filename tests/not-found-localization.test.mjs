import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("missing public pages use a localized Arabic 404 with safe navigation", () => {
  const notFound = readSource("src/app/not-found.tsx");

  assert.match(notFound, /الصفحة غير موجودة/);
  assert.match(notFound, /غير متاحة للعرض حاليًا/);
  assert.match(notFound, /robots:\s*\{\s*index:\s*false/);
  assert.match(notFound, /<nav aria-label="روابط التنقل"/);
  assert.match(notFound, /href="\/events"/);
  assert.match(notFound, /href="\/"/);
});

test("an unpublished or unknown event still uses the 404 boundary", () => {
  const eventPage = readSource("src/app/events/[slug]/page.tsx");

  assert.match(eventPage, /getPublicEventService\(\)\.getEventBySlug\(slug\)/);
  assert.match(eventPage, /if \(!event\) notFound\(\)/);
});
