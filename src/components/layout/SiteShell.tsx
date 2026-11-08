"use client";
import { useRef, type ReactNode } from "react";
import type { PageId } from "@/data/routes";
import { useCinematic } from "@/hooks/useCinematic";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChapterNavigation } from "@/components/home/ChapterNavigation";
export function SiteShell({
  page,
  children,
}: {
  page: PageId;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useCinematic(ref, page);
  return (
    <div className="site-shell" data-page={page} ref={ref}>
      <a href="#main" className="skip-link">
        İçeriğe geç
      </a>
      <Header page={page} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      {page === "home" && <ChapterNavigation />}
    </div>
  );
}
