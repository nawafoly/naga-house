import type { Event, EventQuery } from "../domain";

export interface EventRepository {
  getAll(): Promise<Event[]>;
  getPublished(): Promise<Event[]>;
  getFeatured(): Promise<Event[]>;
  getBySlug(slug: string): Promise<Event | null>;
  searchPublished(query: EventQuery): Promise<Event[]>;
}
