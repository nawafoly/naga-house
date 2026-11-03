import type { Event, EventQuery, EventStatus, TicketProvider } from "../domain";
import type { EventRepository } from "./event.repository";

type BindValue = string | number | null;

export interface PublicD1Statement {
  bind(...values: BindValue[]): PublicD1Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

export interface PublicD1Database {
  prepare(query: string): PublicD1Statement;
}

type EventRow = {
  id: string;
  slug: string;
  status: EventStatus;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  image_url: string;
  cover_image_url: string | null;
  category: string;
  city: string;
  venue: string;
  latitude: number | null;
  longitude: number | null;
  start_at: string | null;
  end_at: string | null;
  schedule_label: string | null;
  amount_from: number | null;
  ticket_provider: TicketProvider;
  ticket_url: string;
  featured: number;
  created_at: string;
  updated_at: string;
};

const columns = `
  id, slug, title_ar, title_en, description_ar, description_en,
  image_url, cover_image_url, category, city, venue, latitude, longitude,
  start_at, end_at, schedule_label, amount_from, ticket_provider,
  ticket_url, status, featured, created_at, updated_at`;

// This filter is mandatory on EVERY public read, including direct slug lookups.
const publicWhere = "status IN ('published', 'sold_out') AND deleted_at IS NULL";
// Direct links remain informative after cancellation or end, but drafts stay private.
const publicDetailWhere = "status IN ('published', 'sold_out', 'cancelled', 'ended') AND deleted_at IS NULL";
const orderBy = "ORDER BY (start_at IS NULL), start_at ASC, created_at DESC";

function toEvent(row: EventRow): Event {
  return {
    id: row.id,
    slug: row.slug,
    titleAr: row.title_ar,
    titleEn: row.title_en ?? undefined,
    descriptionAr: row.description_ar ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    imageUrl: row.image_url,
    coverImageUrl: row.cover_image_url ?? undefined,
    category: row.category,
    location: {
      city: row.city,
      venue: row.venue,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
    },
    startAt: row.start_at ?? undefined,
    endAt: row.end_at ?? undefined,
    scheduleLabel: row.schedule_label ?? undefined,
    price: {
      currency: "SAR",
      amountFrom: row.amount_from ?? undefined,
    },
    ticketProvider: row.ticket_provider,
    ticketUrl: row.ticket_url,
    featured: row.featured === 1,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** A public-only, read-only D1 adapter. Never query drafts from a public path. */
export class D1PublicEventRepository implements EventRepository {
  private readonly db: PublicD1Database;

  constructor(db: PublicD1Database) {
    this.db = db;
  }

  private async list(where = publicWhere, params: BindValue[] = []): Promise<Event[]> {
    const query = `SELECT ${columns} FROM events WHERE ${where} ${orderBy}`;
    const statement = this.db.prepare(query);
    const bound = params.length ? statement.bind(...params) : statement;
    const { results } = await bound.all<EventRow>();
    return results.map(toEvent);
  }

  // The public repository deliberately does not expose the administrative getAll.
  getAll(): Promise<Event[]> {
    return this.getPublished();
  }

  getPublished(): Promise<Event[]> {
    return this.list();
  }

  getFeatured(): Promise<Event[]> {
    return this.list(`${publicWhere} AND status = 'published' AND featured = 1`);
  }

  async getBySlug(slug: string): Promise<Event | null> {
    const row = await this.db
      .prepare(`SELECT ${columns} FROM events WHERE ${publicDetailWhere} AND slug = ? LIMIT 1`)
      .bind(slug)
      .first<EventRow>();
    return row ? toEvent(row) : null;
  }

  searchPublished(query: EventQuery): Promise<Event[]> {
    const filters = [publicWhere];
    const params: BindValue[] = [];

    if (query.category?.trim()) {
      filters.push("lower(category) = ?");
      params.push(query.category.trim().toLowerCase());
    }

    if (query.city?.trim()) {
      filters.push("lower(city) = ?");
      params.push(query.city.trim().toLowerCase());
    }

    if (query.search?.trim()) {
      // instr treats %, _ and quotes literally; values are always bound.
      filters.push(`(
        instr(lower(title_ar), ?) > 0 OR
        instr(lower(coalesce(title_en, '')), ?) > 0 OR
        instr(lower(coalesce(description_ar, '')), ?) > 0 OR
        instr(lower(coalesce(description_en, '')), ?) > 0 OR
        instr(lower(venue), ?) > 0
      )`);
      const search = query.search.trim().toLowerCase();
      params.push(search, search, search, search, search);
    }

    return this.list(filters.join(" AND "), params);
  }
}
