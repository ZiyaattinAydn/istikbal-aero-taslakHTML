import type { ReactNode } from 'react';
import { SiteLink } from './SiteLink';
import { mediaStyle } from '@/lib/urls';

export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`section ${className}`}><div className="wrapper">{children}</div></section>;
}
export function SectionHeading({ kicker, title, lead = '', right }: { kicker: string; title: string; lead?: string; right?: ReactNode }) {
  return <div className="section-header"><div><span className="eyebrow">{kicker}</span><h2 className="section-title">{title}</h2>{lead && <p className="lead">{lead}</p>}</div>{right}</div>;
}
export function InnerHero({ title, description, image, breadcrumb, kicker = 'İSTİKBAL AEROSPACE' }: { title: string; description: string; image: string; breadcrumb?: string; kicker?: string }) {
  return <section className="inner-hero"><div className="inner-bg" aria-hidden="true" style={mediaStyle(image)} /><div className="wrapper"><div className="breadcrumb"><SiteLink href="index.html">ANA SAYFA</SiteLink>{' \u00a0 / \u00a0 '}<b>{breadcrumb || title.toUpperCase()}</b></div><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{description}</p></div></section>;
}
export function FeatureRow({ title, kicker, description, image, reverse = false, href = '', label = 'Daha Fazla' }: { title: string; kicker: string; description: string; image: string; reverse?: boolean; href?: string; label?: string }) {
  return <article className={`feature-row ${reverse ? 'flip' : ''}`}><div className="feature-art" aria-hidden="true" style={mediaStyle(image)} /><div className="feature-copy"><span className="eyebrow no-rule">{kicker}</span><h2>{title}</h2><p>{description}</p>{href && <SiteLink className="btn text" href={href}>{label}<span className="arrow" aria-hidden="true">↗</span></SiteLink>}</div></article>;
}
export function FocusModule({ number, title, description }: { number: string; title: string; description: string }) {
  return <article className="focus-module"><span className="num">{number}</span><h3>{title}</h3><p>{description}</p></article>;
}
