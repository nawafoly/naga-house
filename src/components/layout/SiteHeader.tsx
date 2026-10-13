import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-wide">
          NAGA HOUSE
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link href="/">الرئيسية</Link>
          <Link href="/events">الفعاليات</Link>
          <Link href="/categories">التصنيفات</Link>
        </nav>

        <div className="text-sm text-white/50">
          جدة
        </div>
      </div>
    </header>
  );
}
