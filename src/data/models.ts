export interface TechnologyCardData {
  title: string;
  sequence: string;
  symbol: string;
  description: string;
  href: string;
}
export interface PlatformCardData {
  title: string;
  sequence: string;
  image: string;
  large?: boolean;
  href: string;
  description?: string;
}
export interface NewsCardData {
  title: string;
  category: string;
  image: string;
  href: string;
  description: string;
  linkLabel?: string;
}
export interface PublicWork {
  title: string;
  category: string;
  image: string;
  href: string;
  id: string;
  summary: string;
  visibility: "public-introduction";
  technicalApproval: boolean;
}
export interface PublicNews {
  id: string;
  workId: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  category: string;
  publishedAt: string | null;
  sourceUrl: string | null;
  article: {
    heroTitle: string;
    heroDescription: string;
    eyebrow: string;
    heading: string;
    intro: string;
    sectionHeading: string;
    sectionBody: string;
    breadcrumb: string;
    note?: string;
  };
}
export interface FocusData {
  title: string;
  kicker: string;
  tagline: string;
  bg: string;
  intro: string;
  modules: string[][];
  related: string;
  to: string;
}
export interface PlatformFocusData {
  title: string;
  description: string;
  image: string;
  kicker: string;
  intro: string;
  modules: string[][];
}
