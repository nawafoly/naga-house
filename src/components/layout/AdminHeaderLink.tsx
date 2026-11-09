"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminEntryForPath } from "./admin-entry-model";

export function AdminHeaderLink({ mobile = false }: { mobile?: boolean }) {
  const entry = adminEntryForPath(usePathname(), mobile);

  return (
    <Link
      href={entry.href}
      aria-label={entry.ariaLabel}
      className={
        mobile
          ? "rounded-full border border-brand-orange/60 px-2.5 py-2.5 text-sm font-semibold text-brand-orange transition hover:bg-brand-orange/15 focus-visible:outline-2 focus-visible:outline-brand-orange"
          : "hidden rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:bg-brand-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange sm:inline-flex sm:text-base"
      }
    >
      {entry.label}
    </Link>
  );
}
