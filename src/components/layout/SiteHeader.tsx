import Link from "next/link";

const navigationItems = [
  {
    label: "الرئيسية",
    href: "/",
  },
  {
    label: "الفعاليات",
    href: "/events",
  },
  {
    label: "التصنيفات",
    href: "/categories",
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:h-24 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight transition-opacity hover:opacity-75 sm:text-2xl"
        >
          NAGA HOUSE
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-5 py-3 text-base font-medium text-white/65 transition hover:bg-white/10 hover:text-white lg:px-6 lg:text-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/65 sm:text-base">
            جدة
          </div>

          <Link
            href="/events"
            className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85 sm:inline-flex sm:text-base"
          >
            اكتشف الفعاليات
          </Link>
        </div>
      </div>

      <nav className="flex items-center justify-center gap-1 border-t border-white/[0.06] px-3 py-2 md:hidden">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}