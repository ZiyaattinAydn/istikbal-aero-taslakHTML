"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { normalizePageSearch } from "@/lib/cms/page-organization";

export type LibraryItem = {
  kind: string;
  slug: string;
  title: string;
  summary: string;
  id?: string;
  status?: string;
  canonical: boolean;
};

const types = [
  ["all", "Tüm içerikler"],
  ["news", "Haberler"],
  ["project", "Projeler"],
  ["platform", "Platformlar"],
  ["technology", "Teknolojiler"],
  ["capability", "Kabiliyetler"],
] as const;

const typeNames: Record<string, string> = {
  news: "Haber ve duyuru",
  project: "Proje / AR-GE",
  platform: "Platform",
  technology: "Teknoloji",
  capability: "Kabiliyet",
};

const statuses: Record<string, string> = {
  draft: "Taslak",
  in_review: "İncelemede",
  approved: "Yayına hazır",
  published: "Yayında",
  archived: "Arşiv",
};

export function ContentLibrary({
  items,
  truncated = false,
}: {
  items: LibraryItem[];
  truncated?: boolean;
}) {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visible = useMemo(() => {
    const term = normalizePageSearch(query);
    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (status === "missing" && item.id) return false;
      if (status === "published" && item.status !== "published") return false;
      if (status === "draft" && (!item.id || item.status === "published")) return false;
      return !term || normalizePageSearch(item.title + " " + item.summary).includes(term);
    });
  }, [items, kind, query, status]);
  const pending = items.filter((item) => item.canonical && !item.id).length;
  return (
    <>
      <section className="cms-content-library-intro">
        <div>
          <div className="cms-eyebrow">TEK YERDEN İÇERİK YÖNETİMİ</div>
          <h1>Haberler, projeler ve teknolojiler</h1>
          <p>
            Bir içerik birden fazla sayfada görünse bile yalnızca tek bir kaydı vardır.
            Başlığını ve açıklamasını buradan düzenleyebilirsiniz.
          </p>
        </div>
        <Link href="/admin/new/news" className="cms-action-primary">＋ Yeni haber ekle</Link>
      </section>
      {pending > 0 && (
        <p className="cms-inline-notice" role="status">
          {pending} mevcut içerik için güvenli kayıt aktarımı henüz yapılmadı.
          Aktarılmamış içerikler siteden silinmedi; sayfa editöründe düzenlenebilir.
        </p>
      )}
      <div className="cms-content-library-controls">
        <nav className="cms-page-filter-nav" aria-label="İçerik türüne göre filtrele">
          {types.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={kind === id}
              className={kind === id ? "is-active" : ""}
              onClick={() => setKind(id)}>
              {label}
              <span>{id === "all" ? items.length : items.filter((item) => item.kind === id).length}</span>
            </button>
          ))}
        </nav>
        <div className="cms-content-library-query">
          <label>
            İçerik ara
            <input type="search" value={query} maxLength={100}
              placeholder="Haber, proje veya teknoloji adı..."
              onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>
            Durum
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Tüm durumlar</option>
              <option value="published">Yayında</option>
              <option value="draft">Taslak ve arşiv</option>
              <option value="missing">Aktarım bekliyor</option>
            </select>
          </label>
        </div>
        <p className="cms-page-result-count" role="status">
          {visible.length} içerik görüntüleniyor
          {(kind !== "all" || query || status !== "all") && (
            <button type="button" onClick={() => { setKind("all"); setQuery(""); setStatus("all"); }}>
              Filtreleri temizle
            </button>
          )}
        </p>
      </div>
      {truncated && (
        <p className="cms-inline-notice">
          Son 250 içerik gösteriliyor. Daha eski kayıtlar yönetim panosundan bulunabilir.
        </p>
      )}
      {visible.length > 0 ? (
        <div className="cms-canonical-cards cms-library-results">
          {visible.map((item) => (
            <article key={item.kind + ":" + item.slug} className="cms-canonical-card">
              <div className="cms-canonical-card-meta">
                <span>{typeNames[item.kind] || "İçerik"}</span>
                <span className={"cms-canonical-status" + (item.status === "published" ? " is-published" : "")}>
                  {item.id ? statuses[item.status || "draft"] || "Taslak" : "Aktarım bekliyor"}
                </span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              {item.id ? (
                <Link className="cms-canonical-action" href={"/admin/content/" + item.id}>
                  İçeriği düzenle ↗
                </Link>
              ) : (
                <p className="cms-canonical-unavailable">
                  Mevcut içerik korunuyor. Veritabanı aktarımından sonra tek yerden düzenlenebilir.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="cms-empty-state">
          <h2>Bu filtrede içerik bulunamadı.</h2>
          <button type="button" onClick={() => { setKind("all"); setQuery(""); setStatus("all"); }}>
            Tüm içerikleri göster
          </button>
        </div>
      )}
    </>
  );
}
