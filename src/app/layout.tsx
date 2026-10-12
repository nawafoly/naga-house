import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
