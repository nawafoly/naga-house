import { z } from "zod";

export const eventStatusSchema = z.enum([
  "draft",
  "published",
  "sold_out",
  "cancelled",
  "ended",
]);

export const ticketProviderSchema = z.enum([
  "webook",
  "ticketmx",
  "platinumlist",
  "direct",
  "other",
]);

export const eventLocationSchema = z.object({
  city: z.string().min(1),
  venue: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const eventPriceSchema = z.object({
  amountFrom: z.number().nonnegative().optional(),
  currency: z.literal("SAR"),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),

  titleAr: z.string().min(1),
  titleEn: z.string().min(1).optional(),

  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),

  imageUrl: z.url(),
  coverImageUrl: z.url().optional(),

  category: z.string().min(1),

  location: eventLocationSchema,

  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().optional(),

  price: eventPriceSchema,

  ticketProvider: ticketProviderSchema,
  ticketUrl: z.url(),

  featured: z.boolean(),
  status: eventStatusSchema,

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ValidatedEvent = z.infer<typeof eventSchema>;
