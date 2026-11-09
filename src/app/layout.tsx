import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/style.css";
import "@/styles/motion.css";
import "@/styles/refinement.css";
import "@/styles/cinematic-scroll.css";
import "@/styles/theme-kaan.css";
import "@/styles/migration.css";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  icons: { icon: { url: "/assets/favicon.svg", type: "image/svg+xml" } },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080f18",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700;1,800&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
