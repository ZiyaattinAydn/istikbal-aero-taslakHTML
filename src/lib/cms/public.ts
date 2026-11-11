import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { PageValues } from "./page-values";
import type { ContentBody } from "./model";
export function publicClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY)
    throw Error("CMS is not configured");
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function publicReadsEnabled() {
  return (
    process.env.CMS_PUBLIC_READS === "true" &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_PUBLISHABLE_KEY
  );
}
export async function publishedPage(
  slug: string,
): Promise<(ContentBody & { fields?: PageValues }) | null> {
  if (!publicReadsEnabled()) return null;
  try {
    return await unstable_cache(
      async () => {
        const { data, error } = await publicClient()
          .from("cms_published")
          .select("body")
          .eq("kind", "page")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        return data?.body ?? null;
      },
      ["cms-page", slug],
      { revalidate: 300, tags: [`cms-page-${slug}`] },
    )();
  } catch {
    return null;
  }
}
export type PublishedEntry = {
  document_id: string;
  kind: string;
  slug: string;
  body: ContentBody;
  revision: number;
};
export async function publishedEntries(
  kind: string,
): Promise<PublishedEntry[]> {
  if (!publicReadsEnabled()) return [];
  try {
    return await unstable_cache(
      async () => {
        const { data, error } = await publicClient()
          .from("cms_published")
          .select("document_id,kind,slug,body,revision")
          .eq("kind", kind)
          .order("published_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        return data || [];
      },
      ["cms-list", kind],
      { revalidate: 300, tags: [`cms-list-${kind}`] },
    )();
  } catch {
    return [];
  }
}

export async function publishedEntry(
  kind: string,
  slug: string,
): Promise<PublishedEntry | null> {
  if (!publicReadsEnabled()) return null;
  try {
    return await unstable_cache(
      async () => {
        const { data, error } = await publicClient()
          .from("cms_published")
          .select("document_id,kind,slug,body,revision")
          .eq("kind", kind)
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        return data ?? null;
      },
      ["cms-item", kind, slug],
      { revalidate: 300, tags: [`cms-item-${kind}-${slug}`] },
    )();
  } catch {
    return null;
  }
}

export type EntryLink = {
  document_id: string;
  kind: string;
  slug: string;
  body: ContentBody;
};
export type CoverAsset = {
  id: string;
  alt: string;
  width: number;
  height: number;
};
export async function publishedRelations(ids: string[]): Promise<EntryLink[]> {
  if (!publicReadsEnabled() || !ids.length) return [];
  const keys = [...new Set(ids)].slice(0, 12).sort();
  try {
    return await unstable_cache(
      async () => {
        const { data, error } = await publicClient()
          .from("cms_published")
          .select("document_id,kind,slug,body")
          .in("document_id", keys)
          .in("kind", ["project", "platform", "technology"]);
        if (error) throw error;
        return data || [];
      },
      ["cms-related", ...keys],
      { revalidate: 300, tags: keys.map((id) => `cms-reference-${id}`) },
    )();
  } catch {
    return [];
  }
}
export async function publishedAssets(ids: string[]): Promise<CoverAsset[]> {
  if (!publicReadsEnabled() || !ids.length) return [];
  const keys = [...new Set(ids)].slice(0, 100).sort();
  try {
    return await unstable_cache(
      async () => {
        const { data, error } = await publicClient()
          .from("cms_media")
          .select("id,alt,width,height")
          .in("id", keys)
          .eq("visibility", "public");
        if (error) throw error;
        return data || [];
      },
      ["cms-assets", ...keys],
      { revalidate: 300, tags: keys.map((id) => `cms-media-${id}`) },
    )();
  } catch {
    return [];
  }
}
