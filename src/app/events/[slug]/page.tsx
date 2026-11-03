import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailsView } from "@/features/events/components/EventDetailsView";
import { getPublicEventService } from "@/features/events/server/public-event-service";

export const instant = false;
export const dynamic = "force-dynamic";


interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;

  const event =
    await getPublicEventService().getEventBySlug(slug);

  if (!event) {
    return {
      title: "الفعالية غير موجودة",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = event.status === "cancelled"
    ? `تم إلغاء فعالية ${event.titleAr} في جدة، والحجز غير متاح.`
    : event.status === "ended"
      ? `انتهت فعالية ${event.titleAr} في جدة، والحجز مغلق.`
      : event.status === "sold_out"
        ? `نفدت تذاكر فعالية ${event.titleAr} في جدة حاليًا.`
        : event.descriptionAr ?? `اكتشف تفاصيل ${event.titleAr} في جدة واحجز عبر المنصة الرسمية.`;

  const image =
    event.coverImageUrl ?? event.imageUrl;

  return {
    title: event.titleAr,
    description,

    openGraph: {
      type: "article",
      locale: "ar_SA",
      siteName: "NAGA HOUSE",
      title: event.titleAr,
      description,
      images: [
        {
          url: image,
          alt: event.titleAr,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: event.titleAr,
      description,
      images: [image],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getPublicEventService().getEventBySlug(slug);
  if (!event) notFound();
  return <EventDetailsView event={event} />;
}
