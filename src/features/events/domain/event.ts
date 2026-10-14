export type EventStatus =
  | "draft"
  | "published"
  | "sold_out"
  | "cancelled"
  | "ended";

export type TicketProvider =
  | "webook"
  | "ticketmx"
  | "platinumlist"
  | "direct"
  | "other";

export interface EventLocation {
  city: string;
  venue: string;
  latitude?: number;
  longitude?: number;
}

export interface EventPrice {
  amountFrom?: number;
  currency: "SAR";
}

export interface Event {
  id: string;
  slug: string;

  titleAr: string;
  titleEn?: string;

  descriptionAr?: string;
  descriptionEn?: string;

  imageUrl: string;
  coverImageUrl?: string;

  category: string;

  location: EventLocation;

  startAt?: string;
  endAt?: string;
  scheduleLabel?: string;

  price: EventPrice;

  ticketProvider: TicketProvider;
  ticketUrl: string;

  featured: boolean;
  status: EventStatus;

  createdAt: string;
  updatedAt: string;
}