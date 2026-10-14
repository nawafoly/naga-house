import type { Event } from "../domain";

export const mockEvents: Event[] = [
  {
    id: "evt_black_coffee_2026",
    slug: "black-coffee-jeddah-2026",

    titleAr: "بلاك كوفي في جدة",
    titleEn: "MDLBEAST Presents x IN ACT: Black Coffee",

    descriptionAr:
      "ليلة موسيقية في أونيكس أرينا تجمع Black Coffee مع DISH DASH وBKR B2B RDJ ضمن تجربة موسيقية إلكترونية في جدة.",

    imageUrl:
      "https://www.datocms-assets.com/117767/1790098350-1080x1080-3.jpg?auto=format&fit=max&q=80&w=1600",

    coverImageUrl:
      "https://www.datocms-assets.com/117767/1790098350-1080x1080-3.jpg?auto=format&fit=max&q=80&w=2000",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "Onyx Arena",
    },

    startAt: "2026-10-23T15:00:00.000Z",
    endAt: "2026-10-24T00:30:00.000Z",

    price: {
      amountFrom: 450,
      currency: "SAR",
    },

    ticketProvider: "other",
    ticketUrl:
      "https://www.nofomo.com/events/mdlbeast-presents-x-in-act-black-coffee",

    featured: true,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },

  {
    id: "evt_onyx_two_nights_2026",
    slug: "two-nights-at-onyx-2026",

    titleAr: "ليلتان في أونيكس",
    titleEn: "MDLBEAST Presents: Two Nights at Onyx",

    descriptionAr:
      "ليلتان من الموسيقى الإلكترونية في أونيكس أرينا بمشاركة أكثر من 11 فنانًا، من بينهم BLOND:ISH وBoris Brejcha وSteve Angello وLoco Dice.",

    imageUrl:
      "https://www.datocms-assets.com/117767/1790254386-oct29-30-lineup-1x1.jpg?auto=format&fit=max&q=80&w=1600",

    coverImageUrl:
      "https://www.datocms-assets.com/117767/1790254386-oct29-30-lineup-1x1.jpg?auto=format&fit=max&q=80&w=2000",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "Onyx Arena",
    },

    startAt: "2026-10-29T16:00:00.000Z",
    endAt: "2026-10-31T01:00:00.000Z",

    price: {
      amountFrom: 250,
      currency: "SAR",
    },

    ticketProvider: "other",
    ticketUrl:
      "https://www.nofomo.com/events/mdlbeast-presents-two-nights-at-onyx",

    featured: true,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },

  {
    id: "evt_oia_beach_2026",
    slug: "ia-exclusive-oia-beach-2026",

    titleAr: "I/A Exclusive في OIA Beach",
    titleEn: "I/A Exclusive: OIA Beach",

    descriptionAr:
      "ليلة موسيقية على شاطئ OIA في جدة يتصدرها VANCO بمشاركة DISH DASH وEYAD وNAHAR وCAYAN.",

    imageUrl:
      "https://www.datocms-assets.com/117767/1790611403-1080x1080.png?auto=format&fit=max&q=80&w=1600",

    coverImageUrl:
      "https://www.datocms-assets.com/117767/1790611403-1080x1080.png?auto=format&fit=max&q=80&w=2000",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "OIA Beach",
    },

    startAt: "2026-10-30T16:00:00.000Z",
    endAt: "2026-10-31T00:30:00.000Z",

    price: {
      amountFrom: 500,
      currency: "SAR",
    },

    ticketProvider: "other",
    ticketUrl:
      "https://www.nofomo.com/events/ia-exclusive-oia-beach",

    featured: false,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },

  {
    id: "evt_in_act_anniversary_2026",
    slug: "in-act-anniversary-act-xi-2026",

    titleAr: "الذكرى السنوية لـ IN ACT",
    titleEn: "IN ACT Anniversary - ACT XI",

    descriptionAr:
      "احتفال IN ACT بالذكرى السنوية الثانية في جدة، بليلة موسيقية ممتدة في عبادي الجوهر أرينا.",

    imageUrl:
      "https://www.datocms-assets.com/117767/1784119099-768-x-768.png?auto=format&fit=max&q=80&w=1600",

    coverImageUrl:
      "https://www.datocms-assets.com/117767/1784119099-768-x-768.png?auto=format&fit=max&q=80&w=2000",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "Abadi Al Johar Arena",
    },

    startAt: "2026-11-27T14:00:00.000Z",
    endAt: "2026-11-28T00:30:00.000Z",

    price: {
      amountFrom: 250,
      currency: "SAR",
    },

    ticketProvider: "other",
    ticketUrl:
      "https://www.nofomo.com/events/in-act-anniversary-act-xi",

    featured: true,
    status: "published",

    createdAt: "2026-10-14T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
  },
];