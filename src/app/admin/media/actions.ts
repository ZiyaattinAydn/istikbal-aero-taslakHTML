"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/server";
import { inspectMedia } from "@/lib/cms/media";
export async function uploadMedia(
  _state: { message: string; ok?: boolean },
  form: FormData,
) {
  const { db, user } = await requireAdmin();
  try {
    const file = form.get("file"),
      alt = String(form.get("alt") || "").trim();
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 5 * 1024 * 1024 ||
      !alt ||
      alt.length > 300 ||
      /[<>]/.test(alt) ||
      form.get("rights") !== "on"
    )
      throw Error("Görsel, alternatif metin ve yayın iznini kontrol edin.");
    const bytes = new Uint8Array(await file.arrayBuffer()),
      dimensions = inspectMedia(bytes, file.type);
    const id = crypto.randomUUID(),
      path = `${user.id}/${id}.webp`;
    const { error: uploadError } = await db.storage
      .from("cms-media")
      .upload(path, bytes, { contentType: "image/webp", upsert: false });
    if (uploadError) throw Error("Dosya yüklenemedi.");
    const { error } = await db
      .from("cms_media")
      .insert({
        id,
        path,
        alt,
        rights_approved: true,
        mime: "image/webp",
        bytes: bytes.length,
        ...dimensions,
        created_by: user.id,
      });
    if (error)
      throw Error(
        "Dosya yüklendi fakat kütüphane kaydı tamamlanamadı. Yönetici kontrolü gerekiyor.",
      );
    revalidatePath("/admin/media");
    return { message: "Görsel özel medya kütüphanesine eklendi.", ok: true };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Görsel kaydedilemedi.",
    };
  }
}
export async function publishMedia(form: FormData) {
  const { db, role } = await requireAdmin();
  if (role !== "publisher") throw Error("Yayın yetkisi gerekiyor.");
  const id = String(form.get("id"));
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw Error("Görsel bulunamadı.");
  const { data, error } = await db
    .from("cms_media")
    .update({ visibility: "public" })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data) throw Error("Görsel yayın izni kaydedilemedi.");
  revalidatePath("/admin/media");
}
