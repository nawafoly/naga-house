import { NextRequest, NextResponse } from "next/server";

import { MockEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

function titleMatchesSearch(
  title: string | undefined,
  search: string
) {
  if (!title) {
    return false;
  }

  const normalizedTitle = normalizeSearchValue(title);

  const words = normalizedTitle
    .split(/\s+/)
    .filter(Boolean);

  return (
    normalizedTitle.startsWith(search) ||
    words.some((word) => word.startsWith(search))
  );
}

export async function GET(request: NextRequest) {
  const rawSearch =
    request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const search = normalizeSearchValue(rawSearch);

  if (search.length < 2) {
    return NextResponse.json({
      events: [],
    });
  }

  const publishedEvents =
    await eventService.getPublishedEvents();

  const events = publishedEvents
    .filter(
      (event) =>
        event.location.city.toLowerCase() === "jeddah"
    )
    .filter(
      (event) =>
        titleMatchesSearch(event.titleAr, search) ||
        titleMatchesSearch(event.titleEn, search)
    )
    .slice(0, 6);

  return NextResponse.json({
    events: events.map((event) => ({
      id: event.id,
      slug: event.slug,
      titleAr: event.titleAr,
      titleEn: event.titleEn,
      imageUrl: event.imageUrl,
      category: event.category,
      venue: event.location.venue,
      startAt: event.startAt,
      priceFrom: event.price.amountFrom,
    })),
  });
}