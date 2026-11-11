import schema from "@/data/cms-page-schema.json";
import type { PageField, PageValues } from "./page-values";
export const pageSchemas = schema as (Omit<
  (typeof schema)[number],
  "fields"
> & { fields: PageField[] })[];
export function pageSchema(slug: string) {
  return pageSchemas.find((page) => page.slug === slug);
}
export function validatePageFields(slug: string, input: unknown): PageValues {
  const page = pageSchema(slug);
  if (!page || !input || typeof input !== "object" || Array.isArray(input))
    throw Error("Sayfa alanları geçersiz.");
  const fields: PageValues = {};
  for (const [key, value] of Object.entries(input)) {
    const field = page.fields.find((f) => f.key === key);
    if (
      !field ||
      typeof value !== "string" ||
      value.length > 8000 ||
      /[<>\u0000]/.test(value)
    )
      throw Error("Sayfa alanlarını kontrol edin.");
    if (
      field.kind === "image" &&
      !/^(?:[a-z0-9-]+\.(?:svg|webp)|cms:[0-9a-f-]{36})$/.test(value)
    )
      throw Error("Görseli medya kütüphanesinden seçin.");
    if (
      field.kind === "link" &&
      !/^(?:https:\/\/[^/@]+\/|[a-z0-9-]+\.html(?:\?id=[a-z0-9-]+)?$|mailto:[^ <>]+@[^ <>]+$|tel:\+?[0-9 -]+$)/.test(
        value,
      )
    )
      throw Error("Bağlantıyı kontrol edin.");
    fields[key] = value;
  }
  return fields;
}
