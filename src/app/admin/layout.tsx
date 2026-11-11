import Link from "next/link";
import type { ReactNode } from "react";
import "./style.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "İçerik Yönetimi | İstikbal Aerospace",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="cms">
      <header>
        <Link href="/admin">İSTİKBAL AEROSPACE</Link>
        <span>İçerik yönetimi</span>
      </header>
      {children}
    </main>
  );
}
