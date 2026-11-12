import "server-only";
import type { PageValues } from "./page-values";
import { publishedEntries, publishedEntry, publicReadsEnabled } from "./public";
import {
  legacyKindsForPage,
  legacyNewsIdForPage,
  overlayExistingPublished,
} from "./legacy-content";

/**
 * Only public, already-published snapshots may change legacy cards.
 * DB outages or disabled reads retain the existing, verified static pages.
 */
export async function legacyPublicPageContent(
  slug: string,
  values?: PageValues,
  newsId?: string | string[],
): Promise<PageValues> {
  if (!publicReadsEnabled()) return values ?? {};
  const kinds = legacyKindsForPage(slug);
  const detailSlug = legacyNewsIdForPage(slug, newsId);
  if (!kinds.length && !detailSlug) return values ?? {};
  const [lists, detail] = await Promise.all([
    Promise.all(kinds.map((kind) => publishedEntries(kind))),
    detailSlug ? publishedEntry("news", detailSlug) : Promise.resolve(null),
  ]);
  return overlayExistingPublished(slug, values, lists.flat(), detail);
}
