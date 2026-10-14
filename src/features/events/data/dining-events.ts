import type { Event } from "../domain";

export const diningEvents: Event[] = [
  {
    id: "evt_taste_of_shangrila_jeddah_2026",
    slug: "taste-of-shangrila-jeddah-2026",

    titleAr: "نكهات شانغريلا – جدة",
    titleEn: "Taste of Shangri-La - Jeddah",

    descriptionAr:
      "تجربة طعام ممتدة طوال شهر أكتوبر في شانغريلا جدة، تجمع بين المطبخ الصيني العصري في Shang Palace والنكهات اللبنانية في Niyyali من خلال قوائم مختارة خصيصًا للتجربة.",

    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",

    coverImageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80",

    category: "dining",

    location: {
      city: "Jeddah",
      venue: "Shangri-La Jeddah",
    },

    scheduleLabel: "متاح حتى 31 أكتوبر 2026",

    price: {
      amountFrom: 240,
      currency: "SAR",
    },

    ticketProvider: "direct",
    ticketUrl:
      "https://www.shangri-la.com/jeddah/shangrila/offer-detail/dining/taste-of-shangrila/",

    featured: false,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
];