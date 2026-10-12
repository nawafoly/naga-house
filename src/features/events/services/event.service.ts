import type { Event } from "../domain";
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
}
