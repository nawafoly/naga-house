import Image from "next/image";
import { notFound } from "next/navigation";

import { MockEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await eventService.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="relative aspect-[16/8] w-full">
            <Image
              src={event.coverImageUrl ?? event.imageUrl}
              alt={event.titleAr}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="p-6 sm:p-10">
            <p className="text-sm text-white/50">
              {event.location.city} — {event.location.venue}
            </p>

            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
              {event.titleAr}
            </h1>

            {event.descriptionAr && (
              <p className="mt-6 max-w-3xl text-lg leading-9 text-white/70">
                {event.descriptionAr}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {event.price.amountFrom !== undefined && (
                <span className="text-lg font-semibold">
                  يبدأ من {event.price.amountFrom} ر.س
                </span>
              )}

              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/80"
              >
                احجز الآن
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
