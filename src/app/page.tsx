import { HeroSection } from "@/components/layout";
import { EventCard } from "@/features/events/components";
import { MockEventRepository } from "@/features/events/data";
import { EventService } from "@/features/events/services";

const eventService = new EventService(new MockEventRepository());

export default async function HomePage() {
  const events = await eventService.getFeaturedEvents();

  return (
    <main className="min-h-screen bg-black text-white">
      <HeroSection />

      <section
        id="featured-events"
        className="mx-auto max-w-7xl px-6 py-16"
      >
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/50">
            FEATURED
          </p>

          <h2 className="text-3xl font-bold sm:text-4xl">
            فعاليات مختارة
          </h2>
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
