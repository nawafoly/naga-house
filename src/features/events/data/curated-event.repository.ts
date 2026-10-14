import type { Event, EventQuery } from "../domain";
import type { EventRepository } from "./event.repository";
import { diningEvents } from "./dining-events";
import { entertainmentEvents } from "./entertainment-events";
import { familyEvents } from "./family-events";
import { curatedEvents } from "./curated-events";

const events: Event[] = [
  ...curatedEvents,
  ...entertainmentEvents,
  ...familyEvents,
  ...diningEvents,
];

export class CuratedEventRepository implements EventRepository {
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

  async getBySlug(slug: string): Promise<Event | null> {
    return (
      events.find((event) => event.slug === slug) ??
      null
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