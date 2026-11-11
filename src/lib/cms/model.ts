export const kinds = [
  "page",
  "news",
  "project",
  "platform",
  "technology",
  "capability",
] as const;
export type Kind = (typeof kinds)[number];
export type Approval = "unreviewed" | "in_review" | "approved";
export type Role = "editor" | "publisher";
export type ContentBody = {
  title: string;
  summary: string;
  paragraphs: string[];
  date: string | null;
  source: string | null;
  stage: string | null;
  cover_id?: string | null;
  related_ids?: string[];
};
export function slugify(title: string) {
  return (
    title
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "icerik"
  );
}
export function validateBody(value: unknown): ContentBody {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("İçerik geçersiz.");
  const b = value as Record<string, unknown>;
  const text = (v: unknown, max: number, required = false) => {
    if (
      typeof v !== "string" ||
      v.length > max ||
      (required && !v.trim()) ||
      /[<>\u0000]/.test(v)
    )
      throw Error("Metin alanlarını kontrol edin.");
    return v.trim();
  };
  const title = text(b.title, 160, true),
    summary = text(b.summary, 1000);
  if (!Array.isArray(b.paragraphs) || b.paragraphs.length > 30)
    throw Error("En fazla 30 paragraf ekleyebilirsiniz.");
  const paragraphs = b.paragraphs.map((p) => text(p, 8000));
  const date = b.date === null ? null : text(b.date, 10);
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(date).toISOString().slice(0, 10) !== date)
  )
    throw Error("Tarihi kontrol edin.");
  let source: string | null = null;
  if (b.source) {
    source = text(b.source, 2048);
    const u = new URL(source);
    if (u.protocol !== "https:" || u.username || u.password)
      throw Error("Kaynak HTTPS adresi olmalı.");
  }
  const stage = b.stage === null ? null : text(b.stage, 100);
  const extra: Pick<ContentBody, "cover_id" | "related_ids"> = {};
  if (b.cover_id !== undefined) {
    if (
      b.cover_id !== null &&
      (typeof b.cover_id !== "string" || !isUuid(b.cover_id))
    )
      throw Error("Kapak görselini kontrol edin.");
    extra.cover_id = b.cover_id as string | null;
  }
  if (b.related_ids !== undefined) {
    if (
      !Array.isArray(b.related_ids) ||
      b.related_ids.length > 12 ||
      b.related_ids.some((id) => typeof id !== "string" || !isUuid(id)) ||
      new Set(b.related_ids).size !== b.related_ids.length
    )
      throw Error("En fazla 12 farklı ilişkili içerik seçin.");
    extra.related_ids = b.related_ids;
  }
  return { title, summary, paragraphs, date, source, stage, ...extra };
}
export function requirePublisher(role: Role) {
  if (role !== "publisher") throw Error("Yayın yetkisi gerekiyor.");
}
export function validateUpload(
  bytes: Uint8Array,
  mime: string,
  sizeLimit = 5 * 1024 * 1024,
) {
  if (bytes.length === 0 || bytes.length > sizeLimit)
    throw Error("Görsel en fazla 5 MB olabilir.");
  const png =
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71 &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (!(
    (mime === "image/png" && png) ||
    (mime === "image/jpeg" && jpg) ||
    (mime === "image/webp" && webp)
  ))
    throw Error("Yalnızca doğrulanmış PNG, JPEG veya WebP yükleyin.");
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
    value,
  );
}
