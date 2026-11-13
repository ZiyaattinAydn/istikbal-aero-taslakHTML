"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { routes } from "@/data/routes";
import {
  normalizePageSearch,
  pageCategories,
  pageCategory,
  pageMenu,
} from "@/lib/cms/page-organization";

export function PageBrowser() {
  const [category, setCategory] = useState("all");
  const [submenu, setSubmenu] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = normalizePageSearch(query);
    return routes.filter((route) => {
      if (category !== "all" && pageCategory(route.slug) !== category) return false;
      if (submenu !== "all" && submenu !== route.slug) return false;
      return !search || normalizePageSearch(
        route.title + " " + route.description,
      ).includes(search);
    });
  }, [category, submenu, query]);

  const chooseCategory = (next: string) => {
    setCategory(next);
    setSubmenu("all");
  };
  const children = category === "all" ? [] : pageMenu(category);

  return (
    <>
      <div className="cms-page-discovery">
        <nav className="cms-page-filter-nav" aria-label="Web sayfası kategorileri">
          <button type="button" aria-pressed={category === "all"}
            className={category === "all" ? "is-active" : ""}
            onClick={() => chooseCategory("all")}>Tüm sayfalar
            <span>{routes.length}</span>
          </button>
          {pageCategories.map((item) => (
            <button type="button" key={item.id}
              aria-pressed={category === item.id}
              className={category === item.id ? "is-active" : ""}
              onClick={() => chooseCategory(item.id)}>
              {item.label}
              <span>{routes.filter((route) => pageCategory(route.slug) === item.id).length}</span>
            </button>
          ))}
        </nav>
        {children.length > 1 && (
          <nav className="cms-page-subnav" aria-label="Alt sayfalar">
            <button type="button" aria-pressed={submenu === "all"}
              className={submenu === "all" ? "is-active" : ""}
              onClick={() => setSubmenu("all")}>Tümü</button>
            {children.map((item) => (
              <button type="button" key={item.slug}
                aria-pressed={submenu === item.slug}
                className={submenu === item.slug ? "is-active" : ""}
                onClick={() => setSubmenu(item.slug)}>{item.title}</button>
            ))}
          </nav>
        )}
        <label className="cms-page-discovery-search">
          <span>Sayfalarda ara</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Sayfa adı veya açıklaması..." maxLength={100} />
        </label>
        <p className="cms-page-result-count" role="status">
          {filtered.length} sayfa görüntüleniyor
          {(category !== "all" || submenu !== "all" || query) && (
            <button type="button" onClick={() => { setCategory("all"); setSubmenu("all"); setQuery(""); }}>
              Filtreleri temizle
            </button>
          )}
        </p>
      </div>

      {filtered.length ? (
        <div className="cms-pages-grid">
          {filtered.map((route) => {
            const preview = route.slug === "index" ? "/" : "/" + route.slug;
            return (
              <article className="cms-page-card" key={route.slug}>
                <div className="cms-page-card-top">
                  <span>{pageCategories.find((item) => item.id === pageCategory(route.slug))?.label ?? "Web sayfası"}</span>
                  <span className="cms-page-card-symbol" aria-hidden="true">▤</span>
                </div>
                <h2>{route.title.split("|")[0].trim()}</h2>
                <p>{route.description}</p>
                <div className="cms-page-card-actions">
                  <Link href={"/admin/pages/" + route.slug} className="cms-page-edit">Düzenle ↗</Link>
                  <a href={preview} target="_blank" rel="noopener noreferrer">Sayfayı aç ↗</a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="cms-empty-state">
          <h2>Bu filtrede sayfa bulunamadı.</h2>
          <p>Farklı bir kategori veya arama deneyebilirsiniz.</p>
          <button type="button" onClick={() => { setCategory("all"); setSubmenu("all"); setQuery(""); }}>Tüm sayfaları göster</button>
        </div>
      )}
    </>
  );
}
