import type { Event, EventQuery } from "../domain";
import type { EventRepository } from "../data";

export class EventService {
  private readonly repository: EventRepository;

  constructor(repository: EventRepository) {
    this.repository = repository;
  }

  getPublishedEvents(): Promise<Event[]> {
    return this.repository.getPublished();
  }

  async getFeaturedEvents(): Promise<Event[]> {
    const isJeddahPublished = (event: Event) =>
      event.status === "published" &&
      event.location.city.trim().toLowerCase() === "jeddah";

    const featured = (await this.repository.getFeatured()).filter(isJeddahPublished);
    if (featured.length > 0) {
      return featured;
    }

    // Admin-created events default to featured=0. Keep the homepage useful
    // until a deliberate featured selection is available in the admin panel.
    return (await this.repository.getPublished())
      .filter(isJeddahPublished)
      .slice(0, 3);
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
