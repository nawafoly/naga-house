export type EventLifecycleStatus = "draft" | "published" | "sold_out" | "cancelled" | "ended";

const allowed: Record<EventLifecycleStatus, readonly EventLifecycleStatus[]> = {
  draft: [],
  published: ["sold_out", "cancelled", "ended", "draft"],
  sold_out: ["published", "cancelled", "ended", "draft"],
  cancelled: ["draft"],
  ended: ["draft"],
};

export const eventStatusLabels: Record<EventLifecycleStatus, string> = {
  draft: "مسودة",
  published: "منشورة",
  sold_out: "نفدت التذاكر",
  cancelled: "ملغاة",
  ended: "منتهية",
};

export function isEventLifecycleStatus(value: string): value is EventLifecycleStatus {
  return Object.hasOwn(allowed, value);
}

/**
 * Publication from a draft uses the existing guarded publish endpoint.
 * Cancelled and ended events must return to draft for review before republishing.
 */
export function allowedNextEventStatuses(current: string): readonly EventLifecycleStatus[] {
  return isEventLifecycleStatus(current) ? allowed[current] : [];
}
