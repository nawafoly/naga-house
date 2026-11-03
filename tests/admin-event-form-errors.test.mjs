import test from "node:test";
import assert from "node:assert/strict";
import { validateDraftEventForm } from "../src/features/admin/domain/parse-draft-event.ts";

function testForm(overrides = {}) {
  const fields = {
    slug: "naga-house-test-2026",
    titleAr: "تجربة نظام NAGA HOUSE",
    titleEn: "NAGA HOUSE Test Event",
    descriptionAr: "فعالية تجريبية لاختبار الحفظ",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    category: "entertainment",
    venue: "موقع تجريبي",
    startAt: "",
    scheduleLabel: "يحدد لاحقا",
    amountFrom: "",
    ticketProvider: "nofomo",
    ticketUrl: "https://www.nofomo.com/events/mdlbeast-presents-two-nights-at-onyx",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

test("previously suggested sample inputs are accepted by domain validator", () => {
  const { value, errors } = validateDraftEventForm(testForm());
  assert.ok(value);
  assert.deepEqual(errors, {});
  assert.equal(value.scheduleLabel, "يحدد لاحقا");
  assert.equal(value.startAt, null);
});

test("server identifies missing venue and schedule label precisely", () => {
  const { value, errors } = validateDraftEventForm(testForm({ venue: "", scheduleLabel: "" }));
  assert.equal(value, null);
  assert.ok(errors.venue);
  assert.ok(errors.scheduleLabel);
  assert.equal(errors.imageUrl, undefined);
});

test("server identifies mismatched field formats without echoing user values", () => {
  const suspiciousUrl = "https://images.unsplash.com.evil.example/private";
  const { value, errors } = validateDraftEventForm(testForm({ imageUrl: suspiciousUrl, amountFrom: "9999999", startAt: "2026-02-30T19:30" }));
  assert.equal(value, null);
  assert.ok(errors.imageUrl);
  assert.ok(errors.amountFrom);
  assert.ok(errors.startAt);
  assert.equal(JSON.stringify(errors).includes(suspiciousUrl), false);
});
