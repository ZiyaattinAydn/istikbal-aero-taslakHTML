"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
export function AdminFrame({ children }: { children: ReactNode }) {
  const preview = usePathname().endsWith("/preview");
  return preview ? (
    <div className="cms-preview">{children}</div>
  ) : (
    <main className="cms">
      <header>
        <Link href="/admin">İSTİKBAL AEROSPACE</Link>
        <span>İçerik yönetimi</span>
      </header>
      {children}
    </main>
  );
}
