import type { Event } from "../domain";
import type { EventRepository } from "./event.repository";
import { mockEvents } from "./mock-events";

export class MockEventRepository implements EventRepository {
  async getAll(): Promise<Event[]> {
    return mockEvents;
  }

  async getPublished(): Promise<Event[]> {
    return mockEvents.filter((event) => event.status === "published");
  }

  async getFeatured(): Promise<Event[]> {
    return mockEvents.filter(
      (event) => event.status === "published" && event.featured
    );
  }

  async getBySlug(slug: string): Promise<Event | null> {
    return mockEvents.find((event) => event.slug === slug) ?? null;
  }
}
