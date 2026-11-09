import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getAdminCityLabel } from "../src/features/admin/domain/event-city.ts";

const dashboard = readFileSync(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");
const eventsList = readFileSync(new URL("../src/app/admin/events/page.tsx", import.meta.url), "utf8");

test("admin city label localizes the canonical Jeddah value without altering other cities", () => {
  assert.equal(getAdminCityLabel("jeddah"), "جدة");
  assert.equal(getAdminCityLabel("JEDDAH"), "جدة");
  assert.equal(getAdminCityLabel("riyadh"), "riyadh");
  assert.match(eventsList, /getAdminCityLabel\(event\.city\)/);
});

test("dashboard describes the editing and publishing capabilities already available", () => {
  assert.match(dashboard, /إضافة المسودات وتعديلها ومعاينتها/);
  assert.match(dashboard, /تعديل الفعاليات المنشورة وتغيير حالتها/);
  assert.doesNotMatch(dashboard, /ستكون في المراحل التالية/);
});
