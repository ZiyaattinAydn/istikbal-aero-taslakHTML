"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MediaEditor } from "./MediaEditor";
import { normalizePageSearch } from "@/lib/cms/page-organization";
import { siteMedia } from "@/lib/cms/site-media";

export type ManagedMediaRow = {
  id: string;
  alt: string;
  caption: string;
  revision: number;
  bytes: number;
  width: number;
  height: number;
  visibility: string;
};

export function MediaLibraryGallery({
  media,
  publisher,
}: {
  media: ManagedMediaRow[];
  publisher: boolean;
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const search = normalizePageSearch(query);
  const staticItems = useMemo(
    () => scope === "uploaded" ? [] : siteMedia.filter((item) =>
      !search || normalizePageSearch(item.label + " " + item.name + " " + item.category).includes(search),
    ),
    [scope, search],
  );
  const managed = useMemo(
    () => scope === "site" ? [] : media.filter((item) =>
      !search || normalizePageSearch(item.alt + " " + item.caption).includes(search),
    ),
    [media, scope, search],
  );
  return (
    <section className="cms-media-catalog" aria-labelledby="cms-media-catalog-title">
      <div className="cms-media-catalog-head">
        <h2 id="cms-media-catalog-title">Tüm görseller</h2>
        <p>Sitedeki orijinal dosyalar ve yüklediğiniz görseller birlikte gösterilir. Mevcut görseller kopyalanmaz veya silinmez.</p>
      </div>
      <div className="cms-media-catalog-tools">
        <div className="cms-media-catalog-tabs" role="group" aria-label="Görsel kaynağı">
          {[
            ["all", "Tüm görseller", siteMedia.length + media.length],
            ["site", "Sitede bulunanlar", siteMedia.length],
            ["uploaded", "Yüklenenler", media.length],
          ].map(([id, label, count]) => (
            <button key={id} type="button" aria-pressed={scope === id}
              className={scope === id ? "is-active" : ""}
              onClick={() => setScope(String(id))}>
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <label className="cms-media-search">
          Görsel ara
          <input type="search" placeholder="Görsel adı veya açıklaması..."
            maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <p className="cms-page-result-count" role="status">
          {staticItems.length + managed.length} görsel görüntüleniyor
          {(query || scope !== "all") && (
            <button type="button" onClick={() => { setQuery(""); setScope("all"); }}>
              Filtreleri temizle
            </button>
          )}
        </p>
      </div>
      <div className="cms-media-grid cms-media-grid-unified">
        {staticItems.map((item) => (
          <article className="cms-media-card cms-media-static" key={item.name}>
            <div className="cms-media-thumbnail">
              <Image unoptimized src={"/assets/" + item.name} alt={item.label}
                width={300} height={180} loading="lazy" />
            </div>
            <div className="cms-media-card-top">
              <h2>{item.label}</h2>
              <span className="cms-media-origin">Sitedeki görsel</span>
            </div>
            <p className="cms-media-meta">{item.category} · Değiştirilmeyen mevcut dosya</p>
            <a className="cms-media-view" href={"/assets/" + item.name}
              target="_blank" rel="noopener noreferrer">
              Görseli görüntüle ↗
            </a>
          </article>
        ))}
        {managed.map((item) => (
          <article className="cms-media-card" key={item.id}>
            <div className="cms-media-thumbnail">
              <Image unoptimized src={"/admin/media/" + item.id + "/file"}
                alt={item.alt} width={300} height={180} loading="lazy" />
            </div>
            <div className="cms-media-card-top">
              <h2>{item.alt}</h2>
              <span className={"cms-status-badge cms-status-" + (item.visibility === "public" ? "published" : "draft")}>
                {item.visibility === "public" ? "Yayın izni açık" : "Özel"}
              </span>
            </div>
            <a className="cms-media-view" href={"/admin/media/" + item.id + "/file"}
              target="_blank" rel="noopener noreferrer">
              Görseli görüntüle ↗
            </a>
            <p className="cms-media-meta">{item.width} × {item.height} piksel · {Math.ceil(item.bytes / 1024)} KB</p>
            <MediaEditor key={item.revision} media={item} publisher={publisher} />
          </article>
        ))}
      </div>
      {staticItems.length + managed.length === 0 && (
        <div className="cms-empty-state">
          <h3>Bu filtreyle eşleşen görsel bulunamadı.</h3>
          <p>Aramanızı değiştirebilir veya yeni görsel yükleyebilirsiniz.</p>
          <button type="button" onClick={() => { setQuery(""); setScope("all"); }}>
            Tüm görselleri göster
          </button>
        </div>
      )}
    </section>
  );
}
