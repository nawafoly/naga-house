import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicRoutes = [
  "src/app/page.tsx",
  "src/app/events/page.tsx",
  "src/app/events/[slug]/page.tsx",
  "src/app/categories/page.tsx",
  "src/app/api/events/search/route.ts",
];

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("every visitor surface uses the published-only D1 service", () => {
  for (const path of publicRoutes) {
    const text = source(path);
    assert.match(text, /getPublicEventService/, path);
    assert.doesNotMatch(text, /CuratedEventRepository/, path);
    assert.match(text, /dynamic\s*=\s*["']force-dynamic["']/, path);
  }
});

test("production has no curated fallback and cache components are off", () => {
  const service = source("src/features/events/server/public-event-service.ts");
  const config = source("next.config.ts");
  assert.match(service, /process\.env\.NODE_ENV\s*===\s*["']development["']/);
  assert.match(service, /throw new Error\(["']NAGA_PUBLIC_D1_UNAVAILABLE["']\)/);
  assert.doesNotMatch(config, /cacheComponents:\s*true/);
  assert.doesNotMatch(config, /partialPrefetching:\s*true/);
});
