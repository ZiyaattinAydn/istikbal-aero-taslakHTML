import { navigation, platformLinks, technologyLinks } from "@/data/navigation";
import { routes } from "@/data/routes";
import type { PageField } from "./page-values";

/**
 * Presentation-only organization. Never renames persisted page field keys,
 * modifies default values, or writes to cms_page_fields.
 */
export type PageEditBlock = {
  id: string;
  title: string;
  description: string;
  fields: PageField[];
};

export const pageCategories = navigation.map(([id, label, href]) => ({
  id,
  label,
  slug: href.replace(/\.html$/, ""),
}));

const categorySlugs: Record<string, readonly string[]> = {
  home: ["index"],
  platforms: [...platformLinks.map((item) => item[1].replace(/\.html$/, "")), "platform-detay"],
  tech: technologyLinks.map((item) => item[1].replace(/\.html$/, "")),
  projects: ["projeler", "proje-detay"],
  news: ["haberler", "haber-detay", "ucus-kontrol-paylasimi"],
  about: ["kurumsal"],
  contact: ["iletisim"],
};

const categoryLookup = new Map(
  Object.entries(categorySlugs).flatMap(([id, slugs]) => slugs.map((slug) => [slug, id] as const)),
);

export function pageCategory(slug: string) {
  return categoryLookup.get(slug) ?? null;
}

export function pageMenu(category: string) {
  const slugs = categorySlugs[category] ?? [];
  return slugs.flatMap((slug) => {
    const route = routes.find((item) => item.slug === slug);
    if (!route) return [];
    return [{ slug, title: route.title.split("|")[0].trim() }];
  });
}

export function normalizePageSearch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const compact = (value: string, fallback: string) => {
  const clean = value.replace(/^\s*\d+\s*[\/.-]\s*/, "").replace(/\s+/g, " ").trim();
  return clean.length >= 4 && clean.length < 66 ? clean : fallback;
};

function contentFieldLabel(field: PageField) {
  const key = field.key;
  if (/aria-label/.test(key)) return "Erişilebilirlik açıklaması";
  if (/breadcrumb/.test(key)) return "Sayfa gezinme başlığı";
  if (/sourceUrl/.test(key)) return "Kaynak bağlantısı";
  if (/href|\.to$/.test(key)) return "Bağlantı adresi";
  if (/\.(?:bg|image)$|\.image\.\d+$/.test(key)) return "Görsel";
  if (/\.tagline$/.test(key)) return "Kısa slogan";
  if (/\.intro$/.test(key)) return "Giriş açıklaması";
  if (/\.related$/.test(key)) return "İlişkili konu";
  if (/\.kicker(?:\.\d+)?$/.test(key)) return "Bölüm üst etiketi";
  if (/\.lead(?:\.\d+)?$/.test(key)) return "Bölüm açıklaması";
  if (/\.description(?:\.\d+)?$/.test(key)) return "Açıklama";
  if (/\.summary$/.test(key)) return "Kısa açıklama";
  if (/\.heroTitle$/.test(key)) return "Açılış başlığı";
  if (/\.heroDescription$/.test(key)) return "Açılış açıklaması";
  if (/\.sectionHeading$/.test(key)) return "Alt bölüm başlığı";
  if (/\.sectionBody$/.test(key)) return "Alt bölüm açıklaması";
  if (/\.heading$/.test(key)) return "Bölüm başlığı";
  if (/\.title(?:\.\d+)?$/.test(key)) return "Başlık";
  if (field.kind === "image") return "Görsel";
  if (field.kind === "link") return "Bağlantı adresi";
  if (/^\s*\d+\s*\//.test(field.value)) return "Bölüm üst etiketi";
  if (field.value.trim().length <= 75) return "Kısa metin";
  return "Açıklama paragrafı";
}

export function pageFieldLabel(field: PageField) {
  return contentFieldLabel(field);
}

export function pageContentBlocks(fields: readonly PageField[]): PageEditBlock[] {
  const blocks: PageEditBlock[] = [];
  const known = new Map<string, PageEditBlock>();
  const sections = new Map<string, { index: number; current: PageEditBlock }>();

  const append = (id: string, title: string, description: string, field: PageField) => {
    let block = known.get(id);
    if (!block) {
      block = { id, title, description, fields: [] };
      known.set(id, block);
      blocks.push(block);
    }
    block.fields.push(field);
    return block;
  };

  for (const field of fields) {
    const key = field.key;
    const collection = key.match(/^((?:cards\.(?:platform|technology)|publicWorks|newsList)\.\d+)\./);
    if (collection) {
      const root = collection[1];
      const heading = fields.find((candidate) => candidate.key === root + ".title")?.value ?? "";
      append(root, compact(heading, "İçerik kartı"), "Kartın başlığı, görseli, açıklaması ve bağlantısı", field);
      continue;
    }

    const module = key.match(/^((?:focus|platformFocus)\.[^.]+\.modules\.\d+)\./);
    if (module) {
      const heading = fields.find((candidate) => candidate.key === module[1] + ".1")?.value ?? "";
      append(module[1], compact(heading, "Mühendislik konusu"), "Aynı konuya ait başlık ve açıklama", field);
      continue;
    }

    if (key.startsWith("Hero.")) {
      append("home-hero", "Açılış ekranı", "Ana sayfanın ilk ekranındaki sloganlar ve bağlantılar", field);
      continue;
    }

    if (/^(focus|platformFocus)\./.test(key)) {
      const related = key.endsWith(".related");
      append(related ? "focus-related" : "focus-intro",
        related ? "İlişkili teknolojiler" : "Sayfa tanıtımı",
        related ? "İlişkili içerik açıklamaları" : "Başlık, görsel ve giriş metinleri", field);
      continue;
    }

    if (key.startsWith("FocusContent.")) {
      const suffix = Number(key.match(/\.(\d+)$/)?.[1] ?? -1);
      const last = suffix >= 5 && /\.text\./.test(key);
      append(
        last ? "focus-related" : /\.(?:kicker|title|lead)\./.test(key) ? "focus-approach" : "focus-intro",
        last ? "İlişkili teknolojiler" : /\.(?:kicker|title|lead)\./.test(key) ? "Mühendislik yaklaşımı" : "Sayfa tanıtımı",
        last ? "Bağlantı ve tamamlayıcı açıklamalar" : "Bu bölüme ait metinler", field,
      );
      continue;
    }

    if (key.startsWith("news.") || key.startsWith("NewsDetailContent.")) {
      append("news-detail", "Haber ayrıntıları", "Haber başlığı, açıklamaları, görseli ve kaynağı", field);
      continue;
    }

    // Content components follow the order of the page template. Every new
    // kicker after a content section (or numbered heading) starts a new block.
    const prefix = key.split(".")[0];
    let state = sections.get(prefix);
    const isKicker = /\.kicker\.\d+$/.test(key);
    const isNumberedSection = /\.text\.\d+$/.test(key) && /^\s*\d{1,2}\s*\//.test(field.value);
    const isCover = /\.(?:title\.0|description\.1|image\.2|breadcrumb\.3)$/.test(key);
    const populated = state?.current.fields.some((item) =>
      /\.(?:title|lead|text|description)\./.test(item.key));
    const startNew = !state || ((isKicker || isNumberedSection) && populated && !isCover);
    if (startNew) {
      const index = (state?.index ?? -1) + 1;
      const title = isKicker || isNumberedSection
        ? compact(field.value, "İçerik bölümü")
        : index === 0
          ? prefix === "HomeContent" ? compact(field.value, "Sayfa girişi") : "Sayfa kapağı ve giriş"
          : "İçerik bölümü";
      const id = prefix + "-" + index;
      const block = append(id, title, "Bu bölümde birlikte görünen içerikler", field);
      state = { index, current: block };
      sections.set(prefix, state);
    } else if (state) {
      append(state.current.id, state.current.title, state.current.description, field);
      // A pair of opening kickers belongs to the same heading, not two blocks.
      if (isKicker && !populated && !/^İSTİKBAL AEROSPACE$/i.test(field.value.trim())) {
        state.current.title = compact(field.value, state.current.title);
      }
    }
  }
  // The home hero is rendered before the page body, even though its
  // collectors are appended after HomeContent in the schema inventory.
  const homeHero = known.get("home-hero");
  return homeHero ? [homeHero, ...blocks.filter((block) => block !== homeHero)] : blocks;
}
