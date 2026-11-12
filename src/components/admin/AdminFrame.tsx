"use client";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

const navigation = [
  { href: "/admin", label: "Genel bakış", symbol: "◫", exact: true },
  { href: "/admin/pages", label: "Web sayfaları", symbol: "▤" },
  { href: "/admin/media", label: "Medya kütüphanesi", symbol: "▧" },
];
const createLinks = [
  { href: "/admin/new/news", label: "Haber ve duyuru" },
  { href: "/admin/new/project", label: "Proje / AR-GE" },
  { href: "/admin/new/platform", label: "Platform" },
  { href: "/admin/new/technology", label: "Teknoloji" },
  { href: "/admin/new/capability", label: "Kabiliyet" },
];

export function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const preview = pathname.endsWith("/preview");
  if (preview) return <div className="cms-preview">{children}</div>;
  const auth = pathname === "/admin/login" || pathname === "/admin/mfa";
  if (auth) {
    return (
      <div className="cms-auth-layout">
        <aside className="cms-auth-branding" aria-label="İstikbal Aerospace">
          <Link href="/" className="cms-brand cms-brand-large">
            <span className="cms-brand-symbol" aria-hidden="true">✦</span>
            <span>İSTİKBAL <strong>AEROSPACE</strong></span>
          </Link>
          <div className="cms-auth-visual-copy">
            <div className="cms-auth-overline"><span className="cms-brand-dash" /> KURUMSAL İÇERİK YÖNETİMİ</div>
            <h2>Geleceğin sistemlerini birlikte yönetiyoruz.</h2>
            <p>Platformlar, teknolojiler ve kurumsal gelişmeler. Hepsi tek bir güvenli merkezde.</p>
          </div>
          <div className="cms-auth-visual-footer">
            <span>İSTİKBAL AEROSPACE</span><span>GÜVENLİ ERİŞİM</span>
          </div>
        </aside>
        <main className="cms cms-auth-content">
          <Link href="/" className="cms-auth-mobile-brand">✦ İSTİKBAL AEROSPACE</Link>
          {children}
        </main>
      </div>
    );
  }
  const isCurrent = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <div className={"cms-app" + (menuOpen ? " cms-menu-open" : "")}>
      <button
        className="cms-menu-backdrop"
        onClick={() => setMenuOpen(false)}
        type="button"
        aria-label="Menüyü kapat"
        tabIndex={menuOpen ? 0 : -1}
      />
      <aside className="cms-sidebar">
        <Link className="cms-brand" href="/admin" onClick={() => setMenuOpen(false)}>
          <span className="cms-brand-symbol" aria-hidden="true">✦</span>
          <span>İSTİKBAL <strong>AEROSPACE</strong><small>CONTENT STUDIO</small></span>
        </Link>
        <div className="cms-sidebar-content">
          <div className="cms-nav-caption">ÇALIŞMA ALANI</div>
          <nav aria-label="Yönetim menüsü" className="cms-sidebar-nav">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={"cms-sidebar-link" + (isCurrent(item.href, item.exact) ? " is-active" : "")}
                aria-current={isCurrent(item.href, item.exact) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="cms-sidebar-icon" aria-hidden="true">{item.symbol}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="cms-nav-caption cms-caption-spaced">YENİ İÇERİK</div>
          <nav aria-label="İçerik oluşturma" className="cms-sidebar-nav">
            {createLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={"cms-sidebar-link" + (isCurrent(item.href) ? " is-active" : "")}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="cms-sidebar-icon" aria-hidden="true">＋</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="cms-sidebar-bottom">
          <div className="cms-sidebar-help">
            <span className="cms-online-dot" /> Güvenli yönetim oturumu
          </div>
          <form action={logout}>
            <button className="cms-logout-btn" type="submit">↪ Oturumu kapat</button>
          </form>
        </div>
      </aside>
      <div className="cms-workspace">
        <header className="cms-topbar">
          <button type="button" className="cms-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Yönetim menüsünü aç">☰</button>
          <div className="cms-topbar-title">
            <span className="cms-topbar-eyebrow">İSTİKBAL AEROSPACE / CMS</span>
            <strong>İçerik yönetim merkezi</strong>
          </div>
          <div className="cms-topbar-actions">
            <span className="cms-environment">TEST ORTAMI</span>
            <Link href="/" target="_blank" rel="noreferrer" className="cms-view-site">Siteyi görüntüle ↗</Link>
          </div>
        </header>
        <main className="cms cms-main">{children}</main>
      </div>
    </div>
  );
}
