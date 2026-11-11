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
