"use server";
import { invalidateDocument } from "@/lib/cms/invalidate";
import { isUuid } from "@/lib/cms/model";
import { revalidatePath, updateTag } from "next/cache";
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
    const { error } = await db.from("cms_media").insert({
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
    // Return only the new media ID to the initiating, already authenticated
    // editor; never expose private storage paths or privileged keys.
    return {
      message: "Görsel özel medya kütüphanesine eklendi.",
      ok: true,
      id,
      alt,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Görsel kaydedilemedi.",
    };
  }
}
export async function manageMedia(
  _state: { message: string; ok: boolean },
  form: FormData,
) {
  const { db } = await requireAdmin();
  const id = String(form.get("id") || ""),
    operation = String(form.get("operation") || "");
  if (!isUuid(id) || !["metadata", "allow", "revoke"].includes(operation))
    return { message: "İşlem geçersiz.", ok: false };
  const { data, error } = await db.rpc("cms_manage_media", {
    media_id: id,
    expected: Number(form.get("revision")),
    operation,
    payload: {
      alt: String(form.get("alt") || "").trim(),
      caption: String(form.get("caption") || "").trim(),
      withdraw_publications: form.get("withdraw") === "on",
    },
  });
  if (error)
    return {
      message:
        error.code === "40001"
          ? "Görsel başka bir oturumda değişti. Yeniden açın."
          : "İşlem tamamlanamadı. İzin geri çekmek için bağlı yayınların taslağa alınmasını onaylayın; yetki ve alanları kontrol edin.",
      ok: false,
    };
  updateTag(`cms-media-${id}`);
  for (const item of data?.affected || []) invalidateDocument(item);
  revalidatePath("/admin/media");
  revalidatePath("/admin/pages");
  return {
    message:
      operation === "revoke"
        ? `Yayın izni geri çekildi. ${data.affected.length} yayın taslağa alındı; içerik ve dosya korundu.`
        : "Medya bilgileri ve izinleri kaydedildi.",
    ok: true,
  };
}
