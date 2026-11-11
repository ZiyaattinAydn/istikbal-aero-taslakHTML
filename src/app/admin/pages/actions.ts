"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/cms/server";
import { validatePageFields, pageSchema } from "@/lib/cms/pages";
export async function savePage(
  _state: { message: string; ok?: boolean },
  form: FormData,
) {
  const { db } = await requireAdmin();
  try {
    const slug = String(form.get("slug")),
      page = pageSchema(slug);
    if (!page) throw Error("Sayfa bulunamadı.");
    const fields = validatePageFields(
      slug,
      JSON.parse(String(form.get("fields"))),
    );
    const title = String(form.get("title") || "").trim(),
      summary = String(form.get("summary") || "").trim();
    if (
      !title ||
      title.length > 160 ||
      summary.length > 1000 ||
      /[<>]/.test(title + summary)
    )
      throw Error("Başlık ve açıklamayı kontrol edin.");
    const { data: doc, error: loadError } = await db
      .from("cms_documents")
      .select("id")
      .eq("kind", "page")
      .eq("slug", slug)
      .maybeSingle();
    if (loadError || !doc) throw Error("Sayfa veritabanına henüz aktarılmadı.");
    const { error } = await db.rpc("cms_mutate", {
      doc: doc.id,
      expected: Number(form.get("revision")),
      operation: "save",
      payload: {
        title,
        summary,
        paragraphs: [],
        date: null,
        source: null,
        stage: null,
        fields,
      },
    });
    if (error)
      return {
        message:
          error.code === "40001"
            ? "Sayfa başka bir oturumda değişti. Listeye dönüp yeniden açın."
            : "Taslak kaydedilemedi.",
      };
    revalidatePath(`/admin/pages/${slug}`);
    return {
      message: "Taslak kaydedildi. Önizlemeyi açabilirsiniz.",
      ok: true,
    };
  } catch {
    return {
      message: "Alanlar kaydedilemedi. Değişiklikleriniz ekranda duruyor.",
    };
  }
}
