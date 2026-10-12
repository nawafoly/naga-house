import type { Event } from "../domain";

export const mockEvents: Event[] = [
  {
    id: "evt_001",
    slug: "return-night-2",

    titleAr: "ليلة العودة 2",
    titleEn: "The Return Night 2",

    descriptionAr:
      "فعالية موسيقية تجريبية داخل NAGA HOUSE لعرض بنية النظام قبل ربط البيانات الحقيقية.",

    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",

    coverImageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "Jeddah",
    },

    startAt: "2026-11-20T18:00:00.000Z",
    endAt: "2026-11-20T23:00:00.000Z",

    price: {
      amountFrom: 150,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl:
      "https://webook.com/ar/SA/RUH/music-events/events/the-return-night-2-tickets-rs27-873737",

    featured: true,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },
];
