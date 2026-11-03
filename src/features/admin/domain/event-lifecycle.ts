import type { EventStatus } from "../../events/domain/event";
import { eventStatusLabels } from "../../events/domain/event-status.ts";

export { eventStatusLabels };
export type EventLifecycleStatus = EventStatus;

const allowed: Record<EventLifecycleStatus, readonly EventLifecycleStatus[]> = {
  draft: [],
  published: ["sold_out", "cancelled", "ended", "draft"],
  sold_out: ["published", "cancelled", "ended", "draft"],
  cancelled: ["draft"],
  ended: ["draft"],
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
