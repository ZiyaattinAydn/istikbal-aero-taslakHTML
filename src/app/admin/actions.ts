"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/server";
import {
  kinds,
  slugify,
  validateBody,
  type Kind,
  requirePublisher,
} from "@/lib/cms/model";
export type SaveState = { message: string; ok?: boolean; id?: string };
export async function saveContent(
  _state: SaveState,
  form: FormData,
): Promise<SaveState> {
  const { db } = await requireAdmin();
  try {
    const id = String(form.get("id") || ""),
      revision = Number(form.get("revision") || 0),
      kind = String(form.get("kind") || "");
    if (!kinds.includes(kind as Kind) || kind === "page")
      throw Error("Bu içerik türü bu ekrandan düzenlenemez.");
    const body = validateBody({
      title: form.get("title"),
      summary: form.get("summary"),
      paragraphs: String(form.get("paragraphs") || "").split(/\n\s*\n/),
      date: form.get("date") || null,
      source: form.get("source") || null,
      stage: form.get("stage") || null,
    });
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) throw Error("Kayıt bulunamadı.");
    const { data, error } = await db.rpc("cms_mutate", {
      doc: id || null,
      expected: revision,
      operation: id ? "save" : "create",
      payload: body,
      content_kind: kind,
      content_slug: id
        ? null
        : `${slugify(body.title)}-${crypto.randomUUID().slice(0, 6)}`,
    });
    if (error)
      return {
        message:
          error.code === "40001"
            ? "İçerik başka bir oturumda değişti. Yeniden açıp değişiklikleri karşılaştırın."
            : "Taslak kaydedilemedi. Değişiklikleriniz bu ekranda duruyor.",
      };
    revalidatePath("/admin");
    return { message: "Taslak kaydedildi.", ok: true, id: data };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    };
  }
}
export async function changeStatus(
  _state: SaveState,
  form: FormData,
): Promise<SaveState> {
  const { db, role } = await requireAdmin();
  try {
    const operation = String(form.get("operation") || "");
    if (
      !["review", "approve", "publish", "archive", "restore"].includes(
        operation,
      )
    )
      throw Error("İşlem geçersiz.");
    if (["approve", "publish", "archive"].includes(operation))
      requirePublisher(role);
    const { error } = await db.rpc("cms_mutate", {
      doc: String(form.get("id")),
      expected: Number(form.get("revision")),
      operation,
      payload:
        operation === "restore"
          ? { revision: Number(form.get("version")) }
          : {},
    });
    if (error)
      return {
        message:
          "İşlem tamamlanamadı. Yetki, onay ve güncel sürümü kontrol edin.",
      };
    revalidatePath("/admin");
    return {
      ok: true,
      message:
        operation === "publish"
          ? "Kayıt yayın deposuna alındı. Site bağlantısı henüz etkin değil."
          : "İşlem kaydedildi.",
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    };
  }
}
