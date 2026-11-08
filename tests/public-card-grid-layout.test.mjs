import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getPublicCardGridLayout } from "../src/features/events/components/public-card-grid-layout.ts";

const listingSources = [
  "../src/app/page.tsx",
  "../src/app/events/page.tsx",
  "../src/app/categories/page.tsx",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

test("one card is centered at a readable width across viewport sizes", () => {
  const layout = getPublicCardGridLayout(1);
  assert.match(layout, /mx-auto/);
  assert.match(layout, /max-w-\[520px\]/);
  assert.doesNotMatch(layout, /grid-cols-2|grid-cols-3/);
});

test("two cards form a centered pair without an empty desktop column", () => {
  const layout = getPublicCardGridLayout(2);
  assert.match(layout, /mx-auto/);
  assert.match(layout, /sm:grid-cols-2/);
  assert.doesNotMatch(layout, /grid-cols-3/);
});

test("larger lists retain the original responsive two- and three-column grid", () => {
  for (const count of [3, 4, 8]) {
    const layout = getPublicCardGridLayout(count);
    assert.match(layout, /sm:grid-cols-2/);
    assert.match(layout, /lg:grid-cols-3/);
  }
});

test("home, events and categories use the same card layout rules", () => {
  for (const source of listingSources) {
    assert.match(source, /getPublicCardGridLayout\(/);
  }
});
