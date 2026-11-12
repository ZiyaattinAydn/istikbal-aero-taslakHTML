/**
 * Version-controlled assets already shipped with the public site.
 * This is a read-only catalog: files stay under /public/assets and must not
 * be copied to private Supabase Storage or inserted into cms_media.
 * Keep in sync with the checked-in public/assets directory.
 */
export const siteMedia = [
  { name: "favicon.svg", label: "Site simgesi", category: "Kurumsal kimlik" },
  { name: "hero-dusk.webp", label: "Ana sayfa — gün batımı", category: "Ana sayfa" },
  { name: "hero-flight.webp", label: "Ana sayfa — uçuş", category: "Ana sayfa" },
  { name: "hero-hangar-photo.webp", label: "Hangar fotoğrafı", category: "Ana sayfa" },
  { name: "hero-hangar.svg", label: "Hangar çizimi", category: "Ana sayfa" },
  { name: "platform-flight.svg", label: "Uçuş platformu", category: "Platformlar" },
  { name: "platform-systems.svg", label: "Platform sistemleri", category: "Platformlar" },
  { name: "research-lab.svg", label: "Araştırma laboratuvarı", category: "AR-GE" },
  { name: "tengri-network.svg", label: "TENGRİ ağ görseli", category: "Teknoloji" },
] as const;

const mediaNames = new Set<string>(siteMedia.map((asset) => asset.name));

export function isSiteMedia(name: string): boolean {
  return mediaNames.has(name);
}

export function siteMediaUrl(name: string) {
  return isSiteMedia(name) ? "/assets/" + name : null;
}

export type CmsMediaOption = {
  id: string;
  alt: string;
  visibility: string;
};

/** Authenticated thumbnails must use the protected file endpoint. */
export function mediaThumbnail(value: string): string | null {
  const staticUrl = siteMediaUrl(value);
  if (staticUrl) return staticUrl;
  if (/^cms:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value))
    return "/admin/media/" + value.slice(4) + "/file";
  return null;
}
