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
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setResult({
            query: normalizedQuery,
            events: [],
          });

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

        setResult({
          query: normalizedQuery,
          events: [],
        });
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
          strokeWidth="1.8"
          className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/35"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          type="search"
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
          className="h-20 w-full rounded-[26px] border border-white/15 bg-white/[0.07] pr-16 pl-6 text-lg text-white outline-none backdrop-blur-xl transition placeholder:text-white/30 hover:border-white/25 focus:border-white/40 focus:bg-white/[0.09] sm:text-xl"
        />
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+12px)] z-50 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 shadow-2xl backdrop-blur-2xl">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-white/45">
              جاري البحث...
            </div>
          ) : visibleEvents.length > 0 ? (
            <>
              <div className="divide-y divide-white/[0.07]">
                {visibleEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group flex items-center gap-4 p-4 transition hover:bg-white/[0.06] sm:p-5"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5 sm:h-24 sm:w-24">
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
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                          {getEventCategoryLabel(event.category)}
                        </span>

                        <span className="text-xs text-white/35">
                          {event.venue}
                        </span>
                      </div>

                      <h3 className="truncate text-lg font-semibold text-white sm:text-xl">
                        {event.titleAr}
                      </h3>

                      <p className="mt-2 text-sm text-white/40">
                        {event.priceFrom !== undefined
                          ? `يبدأ من ${event.priceFrom} ر.س`
                          : "السعر يحدد لاحقًا"}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/60 transition group-hover:bg-white group-hover:text-black">
                      ←
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={`/events?search=${encodeURIComponent(normalizedQuery)}`}
                className="flex h-14 items-center justify-center border-t border-white/10 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                عرض كل النتائج
              </Link>
            </>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-base font-medium text-white/70">
                ما لقينا نتيجة مطابقة
              </p>

              <p className="mt-2 text-sm text-white/35">
                جرّب اسم فعالية أو مكان مختلف.
              </p>
            </div>
          )}
        </div>
      )}

      {!canSearch && query.length > 0 && (
        <p className="mt-3 px-2 text-sm text-white/30">
          اكتب حرفين على الأقل لبدء البحث.
        </p>
      )}
    </div>
  );
}