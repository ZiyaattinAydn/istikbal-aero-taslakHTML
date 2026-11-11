"use server";
import { revalidatePath } from "next/cache";
import { invalidateDocument } from "@/lib/cms/invalidate";
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
      cover_id: form.get("cover") || null,
      related_ids: JSON.parse(String(form.get("related") || "[]")),
    });
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) throw Error("Kayıt bulunamadı.");
    const creationId = String(form.get("creationId") || "");
    if (!id && !/^[0-9a-f-]{36}$/i.test(creationId))
      throw Error("Yeni kayıt formunu yeniden açın.");
    const { data, error } = await db.rpc("cms_mutate", {
      doc: id || creationId,
      expected: revision,
      operation: id ? "save" : "create",
      payload: body,
      content_kind: kind,
      content_slug: id
        ? null
        : `${slugify(body.title)}-${creationId.slice(0, 7)}`,
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
    const docId = String(form.get("id"));
    const { data: affected } = await db
      .from("cms_documents")
      .select("kind,slug")
      .eq("id", docId)
      .maybeSingle();
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
    if (affected) {
      revalidatePath(`/admin/pages/${affected.slug}`);
      if (["publish", "archive"].includes(operation)) {
        invalidateDocument({ id: docId, ...affected });
      }
    }
    return {
      ok: true,
      message:
        operation === "publish"
          ? "Kayıt onaylı yayın deposuna alındı. Etkin CMS önizlemesinde önbellek yenilenir."
          : "İşlem kaydedildi.",
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    };
  }
}
