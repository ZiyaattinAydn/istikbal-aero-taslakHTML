import { pageValue, type PageValues } from "@/lib/cms/page-values";
import { SiteLink } from "@/components/ui/SiteLink";
export function Hero({ content = {} }: { content?: PageValues }) {
  return (
    <section
      className={"hero hero-story"}
      aria-label={pageValue(
        content,
        "Hero.aria-label.0",
        "İstikbal Aerospace havacılık vitrini",
        "text",
        "Erişilebilir açıklama",
      )}
    >
      <div className={"hero-stage"}>
        {"\n  "}
        <div
          className={"hero-scene hero-scene-flight"}
          role={"img"}
          aria-label={pageValue(
            content,
            "Hero.aria-label.1",
            "Gün doğumunda dağların üzerinde uçan markasız temsili hava aracı",
            "text",
            "Erişilebilir açıklama",
          )}
        ></div>
        {"\n  "}
        <div
          className={"hero-scene hero-scene-hangar"}
          role={"img"}
          aria-label={pageValue(
            content,
            "Hero.aria-label.2",
            "Alacakaranlıkta havacılık hangarındaki markasız temsili hava aracı",
            "text",
            "Erişilebilir açıklama",
          )}
        ></div>
        {"\n  "}
        <div className={"hero-story-vignette"} aria-hidden={"true"}></div>
        {"\n  "}
        <div className={"hero-story-lines"} aria-hidden={"true"}></div>
        {"\n  "}
        <div className={"wrapper hero-story-layout"}>
          {"\n    "}
          <div className={"hero-story-content"}>
            {"\n      "}
            <div className={"hero-story-eyebrow"}>
              <span className={"hero-kicker-dash"} aria-hidden={"true"}></span>
              {pageValue(
                content,
                "Hero.text.3",
                " HAVACILIK ",
                "text",
                "Metin",
              )}
              <span className={"slash"}>{"/"}</span>
              {pageValue(
                content,
                "Hero.text.4",
                " OTONOM SİSTEMLER",
                "text",
                "Metin",
              )}
            </div>
            {"\n      "}
            <h1>
              <span className={"hero-title-line"}>
                {pageValue(
                  content,
                  "Hero.text.5",
                  "Geleceğin",
                  "text",
                  "Metin",
                )}
              </span>
              <span className={"hero-title-line accent"}>
                {pageValue(
                  content,
                  "Hero.text.6",
                  "sistemlerini",
                  "text",
                  "Metin",
                )}
              </span>
              <span className={"hero-title-line"}>
                {pageValue(
                  content,
                  "Hero.text.7",
                  "tasarlıyoruz.",
                  "text",
                  "Metin",
                )}
              </span>
            </h1>
            {"\n      "}
            <div className={"hero-subline"} aria-hidden={"true"}></div>
            {"\n      "}
            <p className={"hero-story-copy"}>
              {pageValue(
                content,
                "Hero.text.8",
                "Havacılık, gömülü elektronik ve otonom sistemlerin kesişiminde mühendislik.",
                "text",
                "Metin",
              )}
            </p>
            {"\n      "}
            <div className={"hero-story-actions"}>
              <SiteLink
                className={"btn solid"}
                href={pageValue(
                  content,
                  "Hero.href.9",
                  "platformlar.html",
                  "link",
                  "Bağlantı",
                )}
              >
                {pageValue(
                  content,
                  "Hero.text.10",
                  "Platformları Keşfet ",
                  "text",
                  "Metin",
                )}
                <span className={"arrow"} aria-hidden={"true"}>
                  {"↗"}
                </span>
              </SiteLink>
              <SiteLink
                className={"btn outline"}
                href={pageValue(
                  content,
                  "Hero.href.11",
                  "iletisim.html",
                  "link",
                  "Bağlantı",
                )}
              >
                {pageValue(
                  content,
                  "Hero.text.12",
                  "İletişime Geç ",
                  "text",
                  "Metin",
                )}
                <span className={"arrow"} aria-hidden={"true"}>
                  {"↗"}
                </span>
              </SiteLink>
            </div>
            {"\n    "}
          </div>
          {"\n  "}
        </div>
        {"\n  "}
      </div>
      {"\n"}
    </section>
  );
}
