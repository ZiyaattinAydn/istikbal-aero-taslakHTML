"use client";
import { useEffect, type RefObject } from "react";
import type { PageId } from "@/data/routes";
import { mountCinematic } from "@/lib/cinematic";
export function useCinematic(ref: RefObject<HTMLElement | null>, page: PageId) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    document.documentElement.classList.toggle(
      "home-no-scrollbar",
      page === "home",
    );
    const dispose = mountCinematic(root, page);
    return () => {
      dispose();
      document.documentElement.classList.remove("home-no-scrollbar");
    };
  }, [ref, page]);
}
