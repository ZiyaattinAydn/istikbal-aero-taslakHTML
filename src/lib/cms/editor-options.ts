import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export async function editorOptions(db: SupabaseClient, id?: string) {
  const [relations, media] = await Promise.all([
    db
      .from("cms_documents")
      .select("id,kind,title:body->>title")
      .in("kind", ["project", "platform", "technology"])
      .order("updated_at", { ascending: false })
      .limit(200),
    db
      .from("cms_media")
      .select("id,alt,visibility")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (relations.error || media.error)
    throw Error("İçerik ve görsel seçenekleri yüklenemedi.");
  return {
    relations: (relations.data || [])
      .filter((x) => x.id !== id)
      .map((x) => ({ id: x.id, kind: x.kind, title: x.title || "İçerik" })),
    media: media.data || [],
  };
}
