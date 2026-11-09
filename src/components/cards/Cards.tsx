import type {
  TechnologyCardData,
  PlatformCardData,
  NewsCardData,
} from "@/data/models";
import { SiteLink } from "@/components/ui/SiteLink";
import { mediaStyle, safeLocalHref } from "@/lib/urls";

export function TechnologyCard({
  title,
  sequence,
  symbol,
  description,
  href,
}: TechnologyCardData) {
  return (
    <SiteLink className="tech-card" href={safeLocalHref(href)}>
      <span className="num">TECH / {sequence}</span>
      <span className="symbol" aria-hidden="true">
        {symbol}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="card-bottom">
        <span>DETAYLARI GÖR</span>
        <span>↗</span>
      </div>
    </SiteLink>
  );
}
export function PlatformCard({
  title,
  sequence,
  image,
  large = false,
  href,
  description = "",
}: PlatformCardData) {
  return (
    <article className={`platform-card ${large ? "feature-platform" : ""}`}>
      <div
        className="card-image"
        aria-hidden="true"
        style={mediaStyle(image)}
      />
      <div className="card-info">
        <span className="tag cool">MÜHENDİSLİK ALANI</span>
        <span className="caption">SİSTEMLER / {sequence}</span>
        <h3>{title}</h3>
        {description && <p className="platform-desc">{description}</p>}
        <SiteLink href={safeLocalHref(href)} className="text-link">
          Yakından İncele <span>↗</span>
        </SiteLink>
      </div>
    </article>
  );
}
export function NewsCard({
  title,
  category,
  image,
  href,
  description,
  linkLabel = "Paylaşımı Oku",
  hidden = false,
}: NewsCardData & { hidden?: boolean }) {
  return (
    <article className="news-card" data-category={category} hidden={hidden}>
      <div
        className="news-visual"
        aria-hidden="true"
        style={mediaStyle(image)}
      />
      <div className="news-content">
        <span className="news-meta">
          {category.toUpperCase()} · İSTİKBAL AEROSPACE
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
        <SiteLink href={safeLocalHref(href)}>{linkLabel} ↗</SiteLink>
      </div>
    </article>
  );
}
