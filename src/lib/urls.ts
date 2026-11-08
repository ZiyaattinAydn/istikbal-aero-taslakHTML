/** Allowlisted identifiers; query text is never interpreted as markup or a destination. */
export function safeMediaName(value: string): string {
  return /^[a-z0-9-]+\.(svg|webp)$/.test(value) ? value : 'research-lab.svg';
}
export function safeLocalHref(value: string): string {
  return /^[a-z0-9-]+\.html(?:\?id=[a-z0-9-]+)?$/.test(value) ? '/' + value : '#';
}
export function safeExternalSource(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
  catch { return null; }
}
export function mediaStyle(image: string) {
  return { backgroundImage: `url('/assets/${safeMediaName(image)}')` };
}
