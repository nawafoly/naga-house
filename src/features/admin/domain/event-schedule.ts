/** The admin list must show the saved schedule when no precise start time exists. */
export function getAdminEventSchedule(
  startAt: string | null,
  scheduleLabel: string | null,
): string {
  return startAt?.trim() || scheduleLabel?.trim() || "غير محدد";
}
