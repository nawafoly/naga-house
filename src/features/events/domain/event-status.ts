import type { EventStatus } from "./event";

export const eventStatusLabels: Record<EventStatus, string> = {
  draft: "مسودة",
  published: "منشورة",
  sold_out: "نفدت التذاكر",
  cancelled: "ملغاة",
  ended: "منتهية",
};

export const eventStatusNotice: Partial<Record<EventStatus, string>> = {
  sold_out: "نفدت التذاكر لهذه الفعالية حاليًا.",
  cancelled: "تم إلغاء هذه الفعالية. لا يمكن الحجز.",
  ended: "انتهت هذه الفعالية. الحجز مغلق.",
};
