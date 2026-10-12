import type { Event } from "../domain";

export interface EventRepository {
  getAll(): Promise<Event[]>;
  getPublished(): Promise<Event[]>;
  getFeatured(): Promise<Event[]>;
  getBySlug(slug: string): Promise<Event | null>;
}
