import { NextRequest, NextResponse } from "next/server";

import { MockEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!search) {
    return NextResponse.json({
      events: [],
    });
  }

  const events = await eventService.searchPublishedEvents({
    search,
    city: "Jeddah",
  });

  return NextResponse.json({
    events: events.slice(0, 6).map((event) => ({
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
