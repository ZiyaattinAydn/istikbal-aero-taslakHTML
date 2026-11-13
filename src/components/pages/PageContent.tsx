import { pageData, type PageValues } from "@/lib/cms/page-values";
import type { PageId } from "@/data/routes";
import { HomeContent } from "./HomeContent";
import { PlatformsContent } from "./PlatformsContent";
import { TechContent } from "./TechContent";
import { CapabilitiesContent } from "./CapabilitiesContent";
import { TengriContent } from "./TengriContent";
import { ProjectsContent } from "./ProjectsContent";
import { NewsContent } from "./NewsContent";
import { AboutContent } from "./AboutContent";
import { ContactContent } from "./ContactContent";
import { PlatformDetailContent } from "./PlatformDetailContent";
import { ProjectDetailContent } from "./ProjectDetailContent";
import { NewsDetailContent } from "./NewsDetailContent";
import { FocusContent, PlatformFocusContent } from "./FocusContent";
import { findNews } from "@/lib/news";
export function PageContent({
  page,
  newsId,
  content = {},
}: {
  page: PageId;
  newsId?: string | string[];
  content?: PageValues;
}) {
  switch (page) {
    case "home":
      return <HomeContent content={content} />;
    case "platforms":
      return <PlatformsContent content={content} />;
    case "tech":
      return <TechContent content={content} />;
    case "capabilities":
      return <CapabilitiesContent content={content} />;
    case "tengri":
      return <TengriContent content={content} />;
    case "projects":
      return <ProjectsContent content={content} />;
    case "news":
      return <NewsContent content={content} />;
    case "about":
      return <AboutContent content={content} />;
    case "contact":
      return <ContactContent content={content} />;
    case "platformDetail":
      return <PlatformDetailContent content={content} />;
    case "projectDetail":
      return <ProjectDetailContent content={content} />;
    case "newsDetail":
    case "flightControlNews":
      return (
        <NewsDetailContent
          content={content}
          item={pageData(
            findNews(newsId, page === "flightControlNews"),
            "news",
            content,
          )}
        />
      );
    case "iha":
    case "flightArch":
    case "airDefense":
      return <PlatformFocusContent name={page} content={content} />;
    case "autonomy":
    case "embedded":
    case "sensors":
    case "rockets":
    case "communications":
      return <FocusContent name={page} content={content} />;
  }
}
