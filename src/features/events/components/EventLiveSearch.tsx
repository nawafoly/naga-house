"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getEventCategoryLabel } from "../domain";

interface SearchEvent {
  id: string;
  slug: string;
  titleAr: string;
  titleEn?: string;
  imageUrl: string;
  category: string;
  venue: string;
  priceFrom?: number;
}

interface SearchResponse {
  events: SearchEvent[];
}

interface SearchResult {
  query: string;
  events: SearchEvent[];
}

export function EventLiveSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>({
    query: "",
    events: [],
  });
  const [isFocused, setIsFocused] = useState(false);

  const normalizedQuery = query.trim();
  const canSearch = normalizedQuery.length >= 2;
  const showPanel = isFocused && canSearch;

  const isLoading =
    canSearch && result.query !== normalizedQuery;

  const visibleEvents =
    result.query === normalizedQuery
      ? result.events
      : [];

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/events/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setResult({ query: normalizedQuery, events: [] });
          return;
        }

        const data = (await response.json()) as SearchResponse;

        setResult({
          query: normalizedQuery,
          events: data.events,
        });
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setResult({ query: normalizedQuery, events: [] });
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canSearch, normalizedQuery]);

  return (
    <div className="relative w-full max-w-4xl">
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-brand-copper sm:right-6"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          type="search"
          aria-label="ابحث في فعاليات جدة"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
          placeholder="ابحث عن مسرحية، حفلة، تجربة..."
          autoComplete="off"
          className="h-[72px] w-full rounded-[24px] border border-brand-cream/90 bg-brand-cream px-5 pr-16 text-base font-semibold text-brand-ink shadow-[0_12px_32px_rgba(0,0,0,0.14)] outline-none transition placeholder:font-medium placeholder:text-brand-ink/60 hover:bg-white focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/35 sm:h-20 sm:text-lg"
        />
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[24px] border border-brand-cream/20 bg-brand-ink/98 text-brand-cream shadow-2xl backdrop-blur-2xl sm:rounded-[28px]">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-brand-cream/75">
              جاري البحث...
            </div>
          ) : visibleEvents.length > 0 ? (
            <>
              <div className="divide-y divide-brand-cream/10">
                {visibleEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group flex items-center gap-3 p-3 transition hover:bg-brand-green/25 focus-visible:bg-brand-green/25 focus-visible:outline-2 focus-visible:outline-brand-orange sm:gap-4 sm:p-5"
                  >
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-brand-cream/10 sm:h-24 sm:w-24">
                      <Image
                        src={event.imageUrl}
                        alt={event.titleAr}
                        fill
                        sizes="96px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-brand-orange/25 bg-brand-orange/15 px-3 py-1 text-xs text-brand-cream/90">
                          {getEventCategoryLabel(event.category)}
                        </span>

                        <span className="max-w-full truncate text-xs text-brand-cream/65">
                          {event.venue}
                        </span>
                      </div>

                      <h3 className="truncate text-base font-bold text-brand-cream sm:text-xl">
                        {event.titleAr}
                      </h3>

                      <p className="mt-2 text-xs text-brand-cream/70 sm:text-sm">
                        {event.priceFrom !== undefined
                          ? `يبدأ من ${event.priceFrom} ر.س`
                          : "السعر يحدد لاحقًا"}
                      </p>
                    </div>

                    <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-cream/20 bg-brand-cream/10 text-brand-cream/80 transition group-hover:bg-brand-orange group-hover:text-brand-ink">
                      ←
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={`/events?search=${encodeURIComponent(normalizedQuery)}`}
                className="flex h-14 items-center justify-center border-t border-brand-cream/15 text-sm font-bold text-brand-orange transition hover:bg-brand-cream/10 focus-visible:outline-2 focus-visible:outline-brand-orange"
              >
                عرض كل النتائج
              </Link>
            </>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-base font-semibold text-brand-cream">
                ما لقينا نتيجة مطابقة
              </p>

              <p className="mt-2 text-sm text-brand-cream/65">
                جرّب اسم فعالية أو مكان مختلف.
              </p>
            </div>
          )}
        </div>
      )}

      {!canSearch && query.length > 0 && (
        <p className="mt-3 px-2 text-sm text-brand-cream/80">
          اكتب حرفين على الأقل لبدء البحث.
        </p>
      )}
    </div>
  );
}
