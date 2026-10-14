import type { Event } from "../domain";

export const familyEvents: Event[] = [
  {
    id: "evt_sala_city_yasmin_jeddah",
    slug: "sala-city-yasmin-jeddah",

    titleAr: "سالا سيتي – ياسمين مول",
    titleEn: "Sala City - Cenomi Yasmin Mall",

    descriptionAr:
      "وجهة ترفيهية عائلية في جدة تضم ألعابًا وركوبًا ترفيهيًا وألعاب أركيد وأنشطة جماعية وتجارب متنوعة تناسب الأفراد والعائلات.",

    imageUrl:
      "https://framerusercontent.com/images/lpgEryvdf9cN3dxB0sGTFiB8.jpg",

    coverImageUrl:
      "https://framerusercontent.com/images/lpgEryvdf9cN3dxB0sGTFiB8.jpg",

    category: "family",

    location: {
      city: "Jeddah",
      venue: "Cenomi Yasmin Mall",
    },

    scheduleLabel: "متاح للحجز",

    price: {
      amountFrom: 75,
      currency: "SAR",
    },

    ticketProvider: "platinumlist",
    ticketUrl:
      "https://jeddah.platinumlist.net/event-tickets/sala-city",

    featured: true,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
];