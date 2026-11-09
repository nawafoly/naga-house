import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { stagingRobotsHeader } from "../src/lib/staging-robots.ts";

test("staging worker opts out of search indexing", () => {
  assert.equal(
    stagingRobotsHeader("naga-house-staging.nagahouse3.workers.dev"),
    "noindex, nofollow"
  );
  assert.equal(
    stagingRobotsHeader("NAGA-HOUSE-STAGING.NAGAHOUSE3.WORKERS.DEV."),
    "noindex, nofollow"
  );
});

test("production, alternate, and lookalike hosts keep normal SEO", () => {
  for (const hostname of [
    "naga-house.nagahouse3.workers.dev",
    "nagahouse.com",
    "www.nagahouse.com",
    "naga-house-staging.nagahouse3.workers.dev.attacker.test",
    "",
  ]) {
    assert.equal(stagingRobotsHeader(hostname), null, hostname);
  }
});

test("public routing applies the robots header without intercepting auth or assets", () => {
  const source = readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");
  assert.match(source, /stagingRobotsHeader\(request\.nextUrl\.hostname\)/);
  assert.match(source, /response\.headers\.set\("X-Robots-Tag", robots\)/);
  assert.match(source, /matcher:\s*\["\/", "\/events\/:path\*", "\/categories\/:path\*"\]/);
});
