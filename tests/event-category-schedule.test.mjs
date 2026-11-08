import test from "node:test";
import assert from "node:assert/strict";
import { eventCategoryKeys, getEventCategoryLabel } from "../src/features/events/domain/event-category.ts";
import { getAdminEventSchedule } from "../src/features/admin/domain/event-schedule.ts";

test("comedy appears in the canonical event categories with an Arabic label", () => {
  assert.ok(eventCategoryKeys.includes("comedy"));
  assert.equal(getEventCategoryLabel("comedy"), "كوميديا");
});

test("admin list uses the schedule description when precise start is unknown", () => {
  assert.equal(
    getAdminEventSchedule(null, "الخميس 12 نوفمبر، فتح الأبواب 8:30 مساءً"),
    "الخميس 12 نوفمبر، فتح الأبواب 8:30 مساءً",
  );
  assert.equal(getAdminEventSchedule("2026-11-12T20:30:00Z", "قريبًا"), "2026-11-12T20:30:00Z");
  assert.equal(getAdminEventSchedule(null, "  "), "غير محدد");
});
