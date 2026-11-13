import { mediaUrl } from "../urls";
export const collectFields = Symbol("cms-field-collector");
export type FieldKind = "text" | "image" | "link";
export type PageField = {
  key: string;
  label: string;
  kind: FieldKind;
  value: string;
};
export type PageValues = Record<string, string | undefined> & {
  [collectFields]?: (field: PageField) => void;
};
export function pageValue(
  values: PageValues,
  key: string,
  fallback: string,
  kind: FieldKind = "text",
  label = "Metin",
) {
  values[collectFields]?.({ key, label, kind, value: fallback });
  return values[key] ?? fallback;
}
export function pageData<T>(value: T, prefix: string, values: PageValues): T {
  if (!value || typeof value !== "object") return value;
  return new Proxy(value as object, {
    get(target, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      if (typeof key !== "string") return v;
      const path = `${prefix}.${key}`;
      if (
        typeof v === "string" &&
        [
          "title",
          "description",
          "summary",
          "tagline",
          "intro",
          "related",
          "kicker",
          "heading",
          "sectionHeading",
          "sectionBody",
          "heroTitle",
          "heroDescription",
          "eyebrow",
          "breadcrumb",
          "note",
          "image",
          "bg",
          "href",
          "sourceUrl",
        ].includes(key)
      )
        return pageValue(
          values,
          path,
          v,
          ["image", "bg"].includes(key)
            ? "image"
            : ["href", "sourceUrl"].includes(key)
              ? "link"
              : "text",
          (
            {
              title: "Başlık",
              description: "Açıklama",
              summary: "Kısa açıklama",
              image: "Görsel",
              bg: "Görsel",
              href: "Bağlantı",
            } as Record<string, string>
          )[key] || "Metin",
        );
      if (
        Array.isArray(target) &&
        typeof v === "string" &&
        /^\d+$/.test(key) &&
        v.trim() &&
        !/^\d+$/.test(v)
      )
        return pageValue(values, path, v, "text", "Metin");
      return v && typeof v === "object" ? pageData(v, path, values) : v;
    },
  }) as T;
}
export function pageImageStyle(
  values: PageValues,
  key: string,
  fallback: string,
  onlyOverride = false,
) {
  const image = pageValue(values, key, fallback, "image", "Görsel");
  return onlyOverride && values[key] === undefined
    ? undefined
    : { backgroundImage: `url('${mediaUrl(image)}')` };
}
