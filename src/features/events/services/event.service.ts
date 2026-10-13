import type { Event, EventQuery } from "../domain";
import type { EventRepository } from "../data";

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  getPublishedEvents(): Promise<Event[]> {
    return this.repository.getPublished();
  }

  getFeaturedEvents(): Promise<Event[]> {
    return this.repository.getFeatured();
  }

  getEventBySlug(slug: string): Promise<Event | null> {
    return this.repository.getBySlug(slug);
  }

  searchPublishedEvents(query: EventQuery): Promise<Event[]> {
    return this.repository.searchPublished(query);
  }

  async getPublishedCategories(): Promise<string[]> {
    const events = await this.repository.getPublished();

    return [...new Set(events.map((event) => event.category))].sort();
  }
}