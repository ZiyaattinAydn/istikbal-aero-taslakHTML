/** Allowlisted identifiers; query text is never interpreted as markup or a destination. */
export function safeMediaName(value: string): string {
  return /^(?:[a-z0-9-]+\.(?:svg|webp)|cms(?:-preview)?:[0-9a-f-]{36})$/.test(
    value,
  )
    ? value
    : "research-lab.svg";
}
export function safeLocalHref(value: string): string {
  if (
    /^\/icerik\/(news|project|platform|technology|capability)\/[a-z0-9-]{1,80}$/.test(
      value,
    )
  )
    return value;
  return /^[a-z0-9-]+\.html(?:\?id=[a-z0-9-]+)?$/.test(value)
    ? "/" + value
    : "#";
}
export function safeExternalSource(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
export function mediaUrl(image: string) {
  const name = safeMediaName(image);
  if (name.startsWith("cms-preview:"))
    return `/admin/media/${name.slice(12)}/file`;
  return name.startsWith("cms:")
    ? `/cms-media/${name.slice(4)}`
    : `/assets/${name}`;
}
export function mediaStyle(image: string) {
  return { backgroundImage: `url('${mediaUrl(image)}')` };
}
