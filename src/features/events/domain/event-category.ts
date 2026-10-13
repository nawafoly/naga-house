export const eventCategoryLabels: Record<string, string> = {
  music: "موسيقى",
  theater: "مسرح",
  sports: "رياضة",
  family: "عائلة",
  dining: "مطاعم وتجارب",
  entertainment: "ترفيه",
};

export function getEventCategoryLabel(category: string): string {
  return eventCategoryLabels[category] ?? category;
}