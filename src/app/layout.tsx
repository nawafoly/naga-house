import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NAGA HOUSE | فعاليات جدة",
    template: "%s | NAGA HOUSE",
  },

  description:
    "اكتشف فعاليات جدة والحفلات والمسرح والرياضة والتجارب العائلية والمطاعم، واحجز عبر منصات الحجز الرسمية.",

  applicationName: "NAGA HOUSE",

  keywords: [
    "فعاليات جدة",
    "فعاليات جدة اليوم",
    "حفلات جدة",
    "مسرح جدة",
    "تذاكر جدة",
    "فعاليات السعودية",
    "Jeddah events",
    "NAGA HOUSE",
  ],

  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "NAGA HOUSE",
    title: "NAGA HOUSE | فعاليات جدة",
    description:
      "اكتشف أفضل الفعاليات والتجارب في جدة واحجز عبر المنصات الرسمية.",
  },

  twitter: {
    card: "summary_large_image",
    title: "NAGA HOUSE | فعاليات جدة",
    description:
      "اكتشف أفضل الفعاليات والتجارب في جدة واحجز عبر المنصات الرسمية.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-black text-white">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}