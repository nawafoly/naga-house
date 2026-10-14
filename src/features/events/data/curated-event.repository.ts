import {
  eventSchema,
  isTrustedTicketUrl,
  type Event,
  type EventQuery,
} from "../domain";

import type { EventRepository } from "./event.repository";

import { curatedEvents } from "./curated-events";
import { diningEvents } from "./dining-events";
import { entertainmentEvents } from "./entertainment-events";
import { familyEvents } from "./family-events";

function validateCuratedEvents(
  sourceEvents: Event[]
): Event[] {
  const validatedEvents =
    eventSchema.array().parse(sourceEvents);

  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const event of validatedEvents) {
    if (ids.has(event.id)) {
      throw new Error(
        `Duplicate event id: ${event.id}`
      );
    }

    if (slugs.has(event.slug)) {
      throw new Error(
        `Duplicate event slug: ${event.slug}`
      );
    }

    if (
      !isTrustedTicketUrl(
        event.ticketProvider,
        event.ticketUrl
      )
    ) {
      throw new Error(
        `Untrusted ticket URL for event: ${event.slug}`
      );
    }

    ids.add(event.id);
    slugs.add(event.slug);
  }

  return validatedEvents;
}

const events = validateCuratedEvents([
  ...curatedEvents,
  ...entertainmentEvents,
  ...familyEvents,
  ...diningEvents,
]);

export class CuratedEventRepository
  implements EventRepository
{
  async getAll(): Promise<Event[]> {
    return events;
  }

  async getPublished(): Promise<Event[]> {
    return events.filter(
      (event) => event.status === "published"
    );
  }

  async getFeatured(): Promise<Event[]> {
    return events.filter(
      (event) =>
        event.status === "published" &&
        event.featured
    );
  }

  async getBySlug(
    slug: string
  ): Promise<Event | null> {
    return (
      events.find(
        (event) => event.slug === slug
      ) ?? null
    );
  }

  async searchPublished(
    query: EventQuery
  ): Promise<Event[]> {
    const search =
      query.search?.trim().toLowerCase();

    const category =
      query.category?.trim().toLowerCase();

    const city =
      query.city?.trim().toLowerCase();

    return events.filter((event) => {
      if (event.status !== "published") {
        return false;
      }

      if (
        category &&
        event.category.toLowerCase() !== category
      ) {
        return false;
      }

      if (
        city &&
        event.location.city.toLowerCase() !== city
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        event.titleAr,
        event.titleEn,
        event.descriptionAr,
        event.descriptionEn,
        event.location.city,
        event.location.venue,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }
}