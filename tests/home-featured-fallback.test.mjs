import assert from "node:assert/strict";
import test from "node:test";

import { EventService } from "../src/features/events/services/event.service.ts";

function event(slug, status = "published", city = "jeddah") {
  return { slug, status, location: { city } };
}

function service(featured, published, calls) {
  return new EventService({
    async getFeatured() {
      calls.featured += 1;
      return featured;
    },
    async getPublished() {
      calls.published += 1;
      return published;
    },
  });
}

test("homepage keeps manually featured Jeddah events without an extra public read", async () => {
  const calls = { featured: 0, published: 0 };
  const events = await service(
    [event("featured-jeddah")],
    [event("regular-jeddah")],
    calls
  ).getFeaturedEvents();

  assert.deepEqual(events.map(({ slug }) => slug), ["featured-jeddah"]);
  assert.deepEqual(calls, { featured: 1, published: 0 });
});

test("homepage falls back to up to three published Jeddah events when none are featured", async () => {
  const calls = { featured: 0, published: 0 };
  const events = await service(
    [],
    [
      event("first"),
      event("draft-secret", "draft"),
      event("riyadh", "published", "riyadh"),
      event("sold-out", "sold_out"),
      event("second"),
      event("third"),
      event("fourth"),
    ],
    calls
  ).getFeaturedEvents();

  assert.deepEqual(events.map(({ slug }) => slug), ["first", "second", "third"]);
  assert.deepEqual(calls, { featured: 1, published: 1 });
});

test("featured events outside Jeddah do not prevent the homepage fallback", async () => {
  const calls = { featured: 0, published: 0 };
  const events = await service(
    [event("featured-riyadh", "published", "riyadh")],
    [event("regular-jeddah")],
    calls
  ).getFeaturedEvents();

  assert.deepEqual(events.map(({ slug }) => slug), ["regular-jeddah"]);
});

test("homepage stays empty when no published Jeddah event exists", async () => {
  const calls = { featured: 0, published: 0 };
  assert.deepEqual(
    await service([], [event("draft", "draft")], calls).getFeaturedEvents(),
    []
  );
});
