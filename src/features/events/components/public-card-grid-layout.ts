/** Keep short public lists balanced without widening a single card across the page. */
export function getPublicCardGridLayout(count: number): string {
  if (count === 1) {
    return "mx-auto max-w-[520px]";
  }

  if (count === 2) {
    return "mx-auto max-w-[1080px] sm:grid-cols-2";
  }

  return "sm:grid-cols-2 lg:grid-cols-3";
}
