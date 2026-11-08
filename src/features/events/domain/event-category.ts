/** Canonical event categories shared by forms, server validation, and navigation. */
export const eventCategoryKeys = [
  "music",
  "comedy",
  "theater",
  "sports",
  "family",
  "dining",
  "entertainment",
] as const;

export const eventCategoryLabels: Record<string, string> = {
  music: "موسيقى",
  comedy: "كوميديا",
  theater: "مسرح",
  sports: "رياضة",
  family: "عائلة",
  dining: "مطاعم وتجارب",
  entertainment: "ترفيه",
};

export function getEventCategoryLabel(category: string): string {
  return eventCategoryLabels[category] ?? category;
}
