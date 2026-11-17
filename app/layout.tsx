import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "SpeakFlow — Tiếng Anh giao tiếp từ Mất gốc đến C1",
  description: "Lộ trình học tiếng Anh giao tiếp cho người Việt: IPA, từ vựng, nhại âm, gia sư AI hội thoại, phòng phát âm và ôn tập SRS.",
};
export const viewport: Viewport = { themeColor: "#0ea5e9", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Nav />
        <main className="md:pl-64 pb-24 md:pb-10">
          <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8 md:pt-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
