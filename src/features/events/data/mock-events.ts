import type { Event } from "../domain";

export const mockEvents: Event[] = [
  {
    id: "evt_001",
    slug: "jeddah-music-night",

    titleAr: "ليلة جدة الموسيقية",
    titleEn: "Jeddah Music Night",

    descriptionAr:
      "ليلة موسيقية وتجربة ترفيهية في جدة ضمن بيانات NAGA HOUSE التجريبية.",

    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",

    coverImageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",

    category: "music",

    location: {
      city: "Jeddah",
      venue: "Jeddah Superdome",
    },

    startAt: "2026-10-30T18:00:00.000Z",
    endAt: "2026-10-30T23:00:00.000Z",

    price: {
      amountFrom: 150,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: true,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },

  {
    id: "evt_002",
    slug: "jeddah-theater-show",

    titleAr: "ليلة المسرح",
    titleEn: "Theater Night",

    descriptionAr:
      "عرض مسرحي ترفيهي للعائلة في جدة.",

    imageUrl:
      "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",

    category: "theater",

    location: {
      city: "Jeddah",
      venue: "Jeddah Theater",
    },

    startAt: "2026-11-05T17:30:00.000Z",
    endAt: "2026-11-05T20:30:00.000Z",

    price: {
      amountFrom: 95,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: true,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },

  {
    id: "evt_003",
    slug: "jeddah-sports-experience",

    titleAr: "تجربة جدة الرياضية",
    titleEn: "Jeddah Sports Experience",

    descriptionAr:
      "تجربة رياضية جماهيرية تضم أنشطة وتحديات متنوعة.",

    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",

    category: "sports",

    location: {
      city: "Jeddah",
      venue: "King Abdullah Sports City",
    },

    startAt: "2026-11-12T15:00:00.000Z",
    endAt: "2026-11-12T21:00:00.000Z",

    price: {
      amountFrom: 75,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: false,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },

  {
    id: "evt_004",
    slug: "jeddah-family-festival",

    titleAr: "مهرجان العائلة",
    titleEn: "Family Festival",

    descriptionAr:
      "فعالية عائلية في جدة تتضمن ألعابًا وتجارب ترفيهية للأطفال والعائلة.",

    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",

    category: "family",

    location: {
      city: "Jeddah",
      venue: "Jeddah Waterfront",
    },

    startAt: "2026-11-20T14:00:00.000Z",
    endAt: "2026-11-20T22:00:00.000Z",

    price: {
      amountFrom: 50,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: true,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },

  {
    id: "evt_005",
    slug: "jeddah-food-experience",

    titleAr: "تجربة مذاقات جدة",
    titleEn: "Taste of Jeddah",

    descriptionAr:
      "تجربة مطاعم ومذاقات متنوعة تجمع عددًا من التجارب المحلية في جدة.",

    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",

    category: "dining",

    location: {
      city: "Jeddah",
      venue: "Jeddah Yacht Club",
    },

    startAt: "2026-11-27T16:00:00.000Z",
    endAt: "2026-11-27T23:00:00.000Z",

    price: {
      amountFrom: 120,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: false,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },

  {
    id: "evt_006",
    slug: "jeddah-entertainment-zone",

    titleAr: "منطقة الترفيه",
    titleEn: "Entertainment Zone",

    descriptionAr:
      "منطقة ترفيهية تضم ألعابًا وتجارب متنوعة ومناسبة لمجموعات الأصدقاء.",

    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",

    category: "entertainment",

    location: {
      city: "Jeddah",
      venue: "Jeddah Promenade",
    },

    startAt: "2026-12-03T16:00:00.000Z",
    endAt: "2026-12-03T23:30:00.000Z",

    price: {
      amountFrom: 85,
      currency: "SAR",
    },

    ticketProvider: "webook",
    ticketUrl: "https://webook.com/",

    featured: false,
    status: "published",

    createdAt: "2026-10-12T00:00:00.000Z",
    updatedAt: "2026-10-12T00:00:00.000Z",
  },
];