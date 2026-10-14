import type { Event } from "../domain";

export const entertainmentEvents: Event[] = [
  {
    id: "evt_carttel_social_club_2026",
    slug: "carttel-social-club-jeddah-2026",

    titleAr: "نادي كارتل الاجتماعي في جدة",
    titleEn: "Carttel Social Club in Jeddah",

    descriptionAr:
      "تجربة ترفيهية واجتماعية في جدة تجمع الألعاب والطعام في مكان واحد، وتشمل البولينج، والميني غولف، ومحاكي الفورمولا 1، والبلياردو وألعاب الأركيد.",

    imageUrl:
      "https://carttelentertainment.com/wp-content/uploads/2025/01/DSC_0449.jpg",

    coverImageUrl:
      "https://carttelentertainment.com/wp-content/uploads/2025/01/DSC_0563.jpg",

    category: "entertainment",

    location: {
      city: "Jeddah",
      venue: "Carttel Entertainment",
    },

    startAt: "2026-10-14T13:00:00.000Z",
    endAt: "2026-11-30T22:00:00.000Z",

    price: {
      amountFrom: 150,
      currency: "SAR",
    },

    ticketProvider: "platinumlist",
    ticketUrl:
      "https://jeddah.platinumlist.net/event-tickets/103466/carttel-social-hub/",

    featured: true,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
];