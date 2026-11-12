import { cards } from "@/data/cards";
import { publicNews, publicWorks } from "@/data/publications";
import type { ContentBody } from "./model";
import type { PageValues } from "./page-values";
import { pageSchema, pageSchemas } from "./pages";

/**
 * Stable identity map for cards already present on the 21 public pages.
 * A published structured document overrides the corresponding existing card,
 * rather than introducing a second copy in PublishedCards.
 *
 * This module is pure: no database calls, no writes, and no change to existing
 * route/field keys. Legacy pages remain usable when CMS reads are disabled.
 */
export type LegacyKind = "news" | "project" | "platform" | "technology";
export type LegacyRecord = {
  kind: LegacyKind;
  slug: string;
  legacyHref: string;
  body: ContentBody;
};
export type LegacyPublished = {
  kind: string;
  slug: string;
  body: { title: string; summary: string; cover_id?: string | null };
};
export type LegacyNewsDetail = LegacyPublished & {
  body: LegacyPublished["body"] & {
    paragraphs?: string[];
    source?: string | null;
  };
};

const slugFromHref = (href: string) => href.replace(/\.html$/, "");
const uniqueByHref = <T extends { href: string }>(items: readonly T[]) =>
  items.filter((item, index) =>
    items.findIndex((other) => other.href === item.href) === index);

const platforms = uniqueByHref(cards.platform);
const platformHrefs = new Set(platforms.map((item) => item.href));
const technologies = uniqueByHref(cards.technology)
  .filter((item) => !platformHrefs.has(item.href));

const emptyBody = (title: string, summary: string): ContentBody => ({
  title, summary, paragraphs: [], date: null, source: null, stage: null,
});

export const legacyRecords: readonly LegacyRecord[] = [
  ...publicNews.map((item) => ({
    kind: "news" as const,
    slug: item.id,
    legacyHref: item.href,
    body: {
      ...emptyBody(item.title, item.summary),
      paragraphs: [item.article.intro, item.article.sectionBody],
      date: item.publishedAt,
      source: item.sourceUrl,
    },
  })),
  ...publicWorks.map((item) => ({
    kind: "project" as const,
    slug: item.id,
    legacyHref: item.href,
    body: emptyBody(item.title, item.summary),
  })),
  ...platforms.map((item) => ({
    kind: "platform" as const,
    slug: slugFromHref(item.href),
    legacyHref: item.href,
    body: emptyBody(item.title, item.description ?? ""),
  })),
  ...technologies.map((item) => ({
    kind: "technology" as const,
    slug: slugFromHref(item.href),
    legacyHref: item.href,
    body: emptyBody(item.title, item.description),
  })),
];

const lookup = new Map(
  legacyRecords.map((item) => [item.kind + ":" + item.slug, item]),
);

export const legacyRecord = (kind: string, slug: string) =>
  lookup.get(kind + ":" + slug);

export const isExistingContent = (kind: string, slug: string) =>
  lookup.has(kind + ":" + slug);

function sourceForKey(key: string): { kind: LegacyKind; slug: string; part: string } | null {
  const m = key.match(/^cards\.(platform|technology)\.(\d+)\.(title|description|image)$/);
  if (m) {
    const item = m[1] === "platform"
      ? cards.platform[Number(m[2])]
      : cards.technology[Number(m[2])];
    if (!item) return null;
    const kind = platformHrefs.has(item.href) ? "platform" : "technology";
    return { kind, slug: slugFromHref(item.href), part: m[3] };
  }
  const project = key.match(/^publicWorks\.(\d+)\.(title|summary|image)$/);
  if (project) {
    const item = publicWorks[Number(project[1])];
    return item ? { kind: "project", slug: item.id, part: project[2] } : null;
  }
  const news = key.match(/^newsList\.(\d+)\.(title|summary|image)$/);
  if (news) {
    const item = publicNews[Number(news[1])];
    return item ? { kind: "news", slug: item.id, part: news[2] } : null;
  }
  return null;
}

export function legacyKindsForPage(slug: string): LegacyKind[] {
  const kinds = new Set<LegacyKind>();
  for (const field of pageSchema(slug)?.fields ?? []) {
    const source = sourceForKey(field.key);
    if (source && isExistingContent(source.kind, source.slug)) kinds.add(source.kind);
  }
  if (slug === "index" || slug === "haber-detay" || slug === "ucus-kontrol-paylasimi")
    kinds.add("news");
  return [...kinds];
}

export function legacyNewsIdForPage(
  slug: string, query?: string | string[],
): string | null {
  if (slug !== "haber-detay" && slug !== "ucus-kontrol-paylasimi") return null;
  const id = Array.isArray(query) ? query[0] : query;
  const fallback = slug === "ucus-kontrol-paylasimi"
    ? "flight-controller-announcement"
    : "tengri-ai-announcement";
  const selected = id || fallback;
  return publicNews.some((item) => item.id === selected) ? selected : null;
}

const fromCover = (body: LegacyPublished["body"]) =>
  body.cover_id && /^[0-9a-f-]{36}$/i.test(body.cover_id)
    ? "cms:" + body.cover_id : null;

/**
 * Structured publication takes precedence only for the existing item it owns.
 * Page-level draft values for unrelated fields and all original links survive.
 */
export function overlayExistingPublished(
  slug: string,
  values: PageValues | undefined,
  published: readonly LegacyPublished[],
  newsDetail?: LegacyNewsDetail | null,
): PageValues {
  if (published.length === 0 && !newsDetail) return values ?? {};
  const next: PageValues = { ...values };
  const keys = new Set((pageSchema(slug)?.fields ?? []).map((field) => field.key));
  const active = new Map(
    published
      .filter((item) => isExistingContent(item.kind, item.slug))
      .map((item) => [item.kind + ":" + item.slug, item]),
  );
  const patch = (key: string, value: string | null | undefined) => {
    if (keys.has(key) && typeof value === "string") next[key] = value;
  };

  for (const key of keys) {
    const source = sourceForKey(key);
    if (!source) continue;
    const record = active.get(source.kind + ":" + source.slug);
    if (!record) continue;
    const part = source.part;
    if (part === "title") patch(key, record.body.title);
    if (part === "description" || part === "summary") patch(key, record.body.summary);
    if (part === "image") patch(key, fromCover(record.body));
  }

  const feature = active.get("news:tengri-ai-announcement");
  if (slug === "index" && feature) {
    patch("HomeContent.text.33", feature.body.title);
    patch("HomeContent.text.34", feature.body.summary);
    patch("HomeContent.image.31", fromCover(feature.body));
  }
  if (newsDetail && isExistingContent(newsDetail.kind, newsDetail.slug)) {
    const body = newsDetail.body;
    patch("news.article.heroTitle", body.title);
    patch("news.article.heading", body.title);
    patch("news.article.heroDescription", body.summary);
    patch("news.article.intro", body.paragraphs?.[0] ?? body.summary);
    patch("news.article.sectionBody", body.paragraphs?.[1]);
    patch("news.sourceUrl", body.source);
    patch("news.image", fromCover(body));
  }
  return next;
}

/** Public routes which display this canonical content in an existing slot. */
export function legacyRoutesForContent(kind: string, slug: string): string[] {
  if (!isExistingContent(kind, slug)) return [];
  const pages = pageSchemas
    .filter((page) => page.fields.some((field) => {
      const source = sourceForKey(field.key);
      return source?.kind === kind && source.slug === slug;
    }))
    .map((page) => page.slug);
  if (kind === "news") {
    // A legacy news detail URL can select either existing article by ?id=.
    pages.push("haber-detay", "ucus-kontrol-paylasimi");
    if (slug === "tengri-ai-announcement") pages.push("index");
  }
  return [...new Set(pages)];
}
