import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("public search submits a GET query with keyboard support and preserves category", () => {
  const search = source("src/features/events/components/EventLiveSearch.tsx");
  const page = source("src/app/events/page.tsx");

  assert.match(search, /<form\s+role="search"\s+action="\/events"\s+method="get"/);
  assert.match(search, /type="search"\s+name="search"/);
  assert.match(search, /<button\s+type="submit"/);
  assert.match(search, /name="category"\s+value=\{category\}/);
  assert.match(search, /useState\(initialQuery\)/);
  assert.match(page, /initialQuery=\{search\}/);
  assert.match(page, /category=\{category\}/);
});

test("an empty published catalog is not reported as a search mismatch", () => {
  const page = source("src/app/events/page.tsx");

  assert.match(page, /hasPublishedEvents\s*=\s*categories\.length\s*>\s*0/);
  assert.match(page, /!hasPublishedEvents\s*\?\s*"فعاليات جدة قريبًا"/);
  assert.match(page, /hasActiveFilters\s*\?\s*"ما لقينا فعاليات مطابقة"/);
  assert.match(page, /ستظهر هنا فور نشرها رسميًا/);
  assert.match(page, /href=\{hasActiveFilters && hasPublishedEvents \? "\/events" : "\/"\}/);
  assert.doesNotMatch(page, /CuratedEventRepository/);
});
