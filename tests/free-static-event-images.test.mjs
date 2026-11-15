import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isTrustedEventImageUrl,
  validateDraftEventForm,
} from "../src/features/admin/domain/parse-draft-event.ts";

function sampleForm(imageUrl) {
  const fields = {
    slug: "local-image-test",
    titleAr: "فعالية اختبار الصورة",
    titleEn: "",
    descriptionAr: "",
    imageUrl,
    category: "music",
    venue: "مسرح جدة",
    startAt: "",
    scheduleLabel: "قريبًا",
    amountFrom: "",
    ticketProvider: "webook",
    ticketUrl: "https://webook.com/en/events/sample-event",
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

test("approved repository-hosted event images pass server validation", () => {
  for (const imageUrl of [
    "/event-images/jeddah-comedy.webp",
    "/event-images/concert-2026.jpg",
    "/event-images/music-show.jpeg",
    "/event-images/card-1.png",
    "/event-images/cover.avif",
    "https://images.unsplash.com/photo-1500000000",
  ]) {
    assert.equal(isTrustedEventImageUrl(imageUrl), true, imageUrl);
    assert.equal(validateDraftEventForm(sampleForm(imageUrl)).value?.imageUrl, imageUrl);
  }
});

test("image path validation rejects traversal, spoofing and unsupported formats", () => {
  for (const imageUrl of [
    "",
    "/event-images/../private.png",
    "/event-images/%2e%2e.png",
    "/event-images/nested/photo.webp",
    "/event-images/photo.svg",
    "/event-images/photo.webp?source=external",
    "/event-images/photo.webp#fragment",
    "/event-images/PHOTO.PNG",
    "//evil.test/event-images/photo.png",
    "/admin/login",
    "data:image/png;base64,anything",
    "https://images.unsplash.com.evil.test/photo",
    "http://images.unsplash.com/photo",
    "/event-images/" + "a".repeat(180) + ".webp",
  ]) {
    assert.equal(isTrustedEventImageUrl(imageUrl), false, imageUrl);
    assert.equal(validateDraftEventForm(sampleForm(imageUrl)).value, null, imageUrl);
  }
});

test("static image routes bypass Worker and local images bypass image transformation", () => {
  const config = readFileSync(new URL("../cloudflare.config.ts", import.meta.url), "utf8");
  const card = readFileSync(new URL("../src/features/events/components/EventCard.tsx", import.meta.url), "utf8");
  const details = readFileSync(new URL("../src/features/events/components/EventDetailsView.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../src/app/admin/events/new/DraftEventForm.tsx", import.meta.url), "utf8");
  assert.match(config, /"!\/event-images\/\*"/);
  assert.match(card, /unoptimized=\{event\.imageUrl\.startsWith\("\/event-images\/"\)\}/);
  assert.match(details, /unoptimized=\{\(event\.coverImageUrl \?\? event\.imageUrl\)\.startsWith\("\/event-images\/"\)\}/);
  assert.match(form, /name="imageUrl"[^>]*type="text"/);
  assert.doesNotMatch(form, /type="file"/);
});
