import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pages = [
  "../src/app/page.tsx",
  "../src/app/events/page.tsx",
  "../src/app/categories/page.tsx",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("home, events and categories use the same dark surface below the hero", () => {
  for (const source of pages) {
    assert.match(source, /<main className="min-h-screen bg-brand-ink text-brand-cream"/);
    assert.match(source, /className="naga-public-content\b/);
  }
  assert.match(css, /\.naga-public-content\s*\{\s*background:\s*linear-gradient\(/);
});

test("results and category headings remain readable on the dark surface", () => {
  assert.match(pages[1], /عدد النتائج: <span className="font-extrabold text-brand-orange"/);
  assert.match(pages[2], /className="text-2xl font-extrabold text-brand-cream/);
});
