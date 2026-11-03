import test from "node:test";
import assert from "node:assert/strict";
import { MAX_DRAFT_FORM_BODY_BYTES, parseDraftEventForm } from "../src/features/admin/domain/parse-draft-event.ts";

function makeForm(overrides = {}) {
  const fields = {
    slug: "jeddah-test-event-2026",
    titleAr: "فعالية اختبار تجريبية",
    titleEn: "",
    descriptionAr: "",
    imageUrl: "https://images.unsplash.com/photo-1500000000",
    category: "music",
    venue: "قاعة تجريبية",
    startAt: "2026-11-20T19:30",
    scheduleLabel: "",
    amountFrom: "50.00",
    ticketProvider: "webook",
    ticketUrl: "https://webook.com/en/events/sample-event",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

test("valid Saudi-local event form converts start time to ISO UTC", () => {
  const parsed = parseDraftEventForm(makeForm());
  assert.ok(parsed);
  assert.equal(parsed.startAt, "2026-11-20T16:30:00.000Z");
  assert.equal(parsed.amountFrom, 50);
  assert.equal(parsed.ticketProvider, "webook");
});

test("a date-free event requires a schedule label", () => {
  assert.equal(parseDraftEventForm(makeForm({ startAt: "" })), null);
  assert.ok(parseDraftEventForm(makeForm({ startAt: "", scheduleLabel: "الموعد يعلن لاحقًا" })));
});

test("rejects invalid date, slug, disallowed image hosts, categories, and providers", () => {
  for (const changes of [
    { startAt: "2026-02-30T19:30" },
    { slug: "bad/path" },
    { slug: "__proto__" },
    { imageUrl: "http://images.unsplash.com/photo-x" },
    { imageUrl: "https://images.unsplash.com.evil.example/test" },
    { category: "unknown" },
    { ticketProvider: "other" },
    { ticketProvider: "direct" },
  ]) assert.equal(parseDraftEventForm(makeForm(changes)), null);
});

test("rejects negative, excessive, nonnumeric price and overly long text", () => {
  for (const changes of [
    { amountFrom: "-1" },
    { amountFrom: "1e10" },
    { amountFrom: "1000000" },
    { amountFrom: "50.123" },
    { titleAr: "a".repeat(161) },
  ]) assert.equal(parseDraftEventForm(makeForm(changes)), null);
});

// Browsers submit URL-encoded form bodies; Arabic text expands under percent-encoding.
test("maximum valid Arabic description fits the draft POST request size limit", () => {
  const form = makeForm({
    descriptionAr: "م".repeat(5000),
    titleAr: "ح".repeat(160),
    venue: "ج".repeat(160),
    scheduleLabel: "ق".repeat(160),
  });
  assert.ok(parseDraftEventForm(form));
  const encoded = new URLSearchParams(form).toString();
  const bytes = Buffer.byteLength(encoded, "utf8");
  assert.ok(bytes > 20_000, "the old cap rejected valid Arabic descriptions");
  assert.ok(bytes <= MAX_DRAFT_FORM_BODY_BYTES, "a valid form must not exceed the POST cap");
});
