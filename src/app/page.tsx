import { MockEventRepository } from "@/features/events/data";
import { EventCard } from "@/features/events/components";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

export default async function HomePage() {
  const events = await eventService.getFeaturedEvents();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/50">
            NAGA HOUSE
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            فعاليات جدة
          </h1>

          <p className="mt-4 max-w-2xl text-white/60">
            اكتشف الفعاليات المختارة في جدة، ثم انتقل إلى منصة التذاكر الرسمية لإكمال الحجز.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
