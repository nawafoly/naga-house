import Image from "next/image";
import Link from "next/link";

const navigationItems = [
  { label: "الرئيسية", href: "/" },
  { label: "الفعاليات", href: "/events" },
  { label: "التصنيفات", href: "/categories" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-cream/15 bg-brand-ink/95 text-brand-cream backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-[92px] sm:px-6 lg:h-[100px] lg:px-8">
        <Link
          href="/"
          aria-label="NAGA HOUSE - الرئيسية"
          className="flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
        >
          <Image
            src="/brand/naga-house-on-dark.svg"
            alt="NAGA HOUSE"
            width={200}
            height={78}
            priority
            className="h-[61px] w-auto object-contain sm:h-[74px] lg:h-[79px]"
          />
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-3 text-base font-semibold text-brand-cream/80 transition hover:bg-brand-orange/15 hover:text-brand-cream focus-visible:outline-2 focus-visible:outline-brand-orange lg:px-6 lg:text-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="rounded-full border border-brand-cream/20 bg-brand-cream/10 px-3 py-2 text-sm font-semibold text-brand-cream sm:px-4 sm:text-base">
            جدة
          </span>

          <Link
            href="/events"
            className="hidden rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange sm:inline-flex sm:text-base"
          >
            اكتشف الفعاليات
          </Link>
        </div>
      </div>

      <nav
        aria-label="قائمة الجوال"
        className="flex items-center justify-center gap-1 border-t border-brand-cream/10 px-3 py-2 md:hidden"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-brand-cream/85 transition hover:bg-brand-orange/15 hover:text-brand-cream focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
