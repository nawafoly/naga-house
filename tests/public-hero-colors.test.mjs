import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homepage = readFileSync(new URL("../src/components/layout/HeroSection.tsx", import.meta.url), "utf8");
const events = readFileSync(new URL("../src/app/events/page.tsx", import.meta.url), "utf8");
const categories = readFileSync(new URL("../src/app/categories/page.tsx", import.meta.url), "utf8");
const globalCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("homepage, events, and categories share the exact same hero gradient and texture", () => {
  for (const [page, source] of [
    ["homepage", homepage],
    ["events", events],
    ["categories", categories],
  ]) {
    assert.match(source, /<section className="naga-hero\b/, `${page} must use the shared hero style`);
    assert.match(source, /className="naga-hero-lines\b/, `${page} must use the shared hero texture`);
  }
  assert.match(globalCss, /\.naga-hero\s*\{\s*background:\s*radial-gradient\(/);
  assert.doesNotMatch(events, /bg-\[radial-gradient\(/);
  assert.doesNotMatch(categories, /bg-\[radial-gradient\(/);
});
