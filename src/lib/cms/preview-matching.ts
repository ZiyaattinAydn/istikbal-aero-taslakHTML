/**
 * A visual editor may highlight a target only when it is unambiguous.
 * Never guess by substring: short or repeated text can otherwise edit the
 * wrong place on a real company page.
 */
export function uniqueTextCandidate<T>(
  candidates: readonly T[],
  source: string,
  text: (candidate: T) => string,
): T | null {
  const exact = candidates.filter((candidate) => text(candidate) === source);
  if (exact.length > 0) return exact.length === 1 ? exact[0] : null;

  const normalizedSource = source.trim();
  if (!normalizedSource) return null;
  const trimmed = candidates.filter((candidate) => text(candidate).trim() === normalizedSource);
  return trimmed.length === 1 ? trimmed[0] : null;
}

/** Resolve only exact media/link destinations, not similar file names. */
export function normalizedPreviewUrl(raw: string): string | null {
  try {
    const url = new URL(raw, "https://preview.invalid/");
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.host !== "preview.invalid" && !/^https?:\/\//.test(raw)) return null;
    return url.host + url.pathname + url.search;
  } catch {
    return null;
  }
}

export function samePreviewUrl(left: string | null, right: string | null): boolean {
  return Boolean(left && right && normalizedPreviewUrl(left) === normalizedPreviewUrl(right));
}

/** An inline CSS background must contain exactly this URL. */
export function styleHasMediaUrl(style: string | null, expected: string): boolean {
  if (!style) return false;
  const patterns = [...style.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)];
  return patterns.some((match) => samePreviewUrl(match[2].trim(), expected));
}
