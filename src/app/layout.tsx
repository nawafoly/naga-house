import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "NAGA HOUSE",
  description: "اكتشف فعاليات جدة واحجز عبر منصات التذاكر الرسمية.",
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
