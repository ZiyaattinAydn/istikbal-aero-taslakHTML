"use client";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { navigation, platformLinks, technologyLinks } from "@/data/navigation";
import type { PageId } from "@/data/routes";
import { useNavigationFit } from "@/hooks/useNavigationFit";
import { SiteLink } from "@/components/ui/SiteLink";
import { LanguagePicker } from "@/components/navigation/LanguagePicker";
import { Brand } from "./Brand";

type Menu = "platforms" | "tech" | "mobile" | null;
const platformPages: PageId[] = [
  "platforms",
  "platformDetail",
  "iha",
  "flightArch",
  "airDefense",
];
const techPages: PageId[] = [
  "tech",
  "tengri",
  "capabilities",
  "autonomy",
  "embedded",
  "sensors",
  "rockets",
  "communications",
];
export function Header({ page }: { page: PageId }) {
  const ref = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [sub, setSub] = useState<"platforms" | "tech" | null>(null);
  const compact = useNavigationFit(ref);
  const focusTrigger = (which: Menu) =>
    ref.current
      ?.querySelector<HTMLButtonElement>(
        which === "platforms"
          ? "#platform-trigger"
          : which === "tech"
            ? "#tech-trigger"
            : "#mobile-trigger",
      )
      ?.focus({ preventScroll: true });
  const close = () => {
    setMenu(null);
    setSub(null);
  };
  useEffect(() => {
    if (!menu) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setMenu(null);
        setSub(null);
      }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        focusTrigger(menu);
        setMenu(null);
        setSub(null);
      }
    };
    const resize = () => {
      setMenu(null);
      setSub(null);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [menu]);
  function focusPanel(which: "platforms" | "tech") {
    requestAnimationFrame(() =>
      ref.current
        ?.querySelector<HTMLAnchorElement>(
          which === "platforms" ? "#platform-menu a" : "#mega-menu a",
        )
        ?.focus({ preventScroll: true }),
    );
  }
  function disclosure(which: "platforms" | "tech", mobile = false) {
    const platform = which === "platforms",
      label = platform ? "Platformlar" : "Teknolojiler";
    const active = (platform ? platformPages : techPages).includes(page);
    const current = page === which;
    const expanded = mobile ? sub === which : menu === which;
    const id = mobile
      ? platform
        ? "mobile-platform"
        : "mobile-tech"
      : platform
        ? "platform-trigger"
        : "tech-trigger";
    const panel = mobile
      ? platform
        ? "mobile-platform-sub"
        : "mobile-sub"
      : platform
        ? "platform-menu"
        : "mega-menu";
    const open = (event: MouseEvent<HTMLButtonElement>) => {
      if (mobile) setSub(expanded ? null : which);
      else {
        const next = event.detail > 0 || !expanded;
        setMenu(next ? which : null);
        if (next && event.detail === 0) focusPanel(which);
      }
    };
    const down = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!mobile && event.key === "ArrowDown") {
        event.preventDefault();
        setMenu(which);
        focusPanel(which);
      }
    };
    const button = (
      <button
        type="button"
        id={id}
        className={mobile ? "" : `nav-link${active ? " active" : ""}`}
        aria-controls={panel}
        aria-expanded={expanded}
        aria-label={
          current
            ? platform
              ? "Platform alanları"
              : "Teknoloji alanları"
            : undefined
        }
        onClick={open}
        onKeyDown={down}
        onPointerEnter={(event) => {
          if (!mobile && event.pointerType === "mouse") setMenu(which);
        }}
      >
        {!current && <>{label} </>}
        {mobile ? (
          <span aria-hidden="true">＋</span>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m4 7 6 6 6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>
    );
    return current ? (
      <div
        className={`${mobile ? "mobile-" : ""}${platform ? "platform" : "tech"}-current`}
        onPointerEnter={(event) => {
          if (!mobile && event.pointerType === "mouse") setMenu(which);
        }}
      >
        <SiteLink
          className={mobile ? "" : "nav-link active"}
          href={platform ? "platformlar.html" : "teknolojiler.html"}
        >
          {label}
        </SiteLink>
        {button}
      </div>
    ) : (
      button
    );
  }
  function active(key: string) {
    return (
      page === key ||
      (key === "projects" && page === "projectDetail") ||
      (key === "news" && ["newsDetail", "flightControlNews"].includes(page))
    );
  }
  function mega(which: "platforms" | "tech") {
    const platform = which === "platforms",
      open = menu === which;
    return (
      <div
        id={platform ? "platform-menu" : "mega-menu"}
        className={`mega${open ? " open" : ""}`}
        role="region"
        aria-label={
          platform ? "Platformlar alt menü" : "Teknolojiler mega menü"
        }
        inert={!open}
      >
        <div className="mega-inner">
          <div
            className="mega-image"
            style={
              platform
                ? {
                    backgroundImage:
                      'linear-gradient(0deg,rgba(7,17,27,.97),transparent 60%),url("/assets/hero-hangar-photo.webp")',
                  }
                : undefined
            }
          >
            <span className="eyebrow no-rule">
              {platform ? "PLATFORMLAR / 01—04" : "TEKNOLOJİLER / 01—08"}
            </span>
            <h3>{platform ? "Platformdan sisteme." : "Fikirden sisteme."}</h3>
            <p>
              {platform
                ? "İnsansız hava platformları, uçuş elektroniği ve bağlantılı sistemler."
                : "İstikbal Aerospace'in teknoloji ve mühendislik çalışma alanlarını keşfedin."}
            </p>
          </div>
          <div className="mega-links">
            <div className="mega-links-head">
              <span className="eyebrow no-rule">
                {platform ? "PLATFORM ALANLARI" : "TEKNOLOJİ ALANLARI"}
              </span>
              <button
                className={platform ? "close-platform" : "close-mega"}
                id={platform ? undefined : "close-mega"}
                type="button"
                aria-label={
                  platform ? "Platform menüsünü kapat" : "Mega menüyü kapat"
                }
                onClick={() => {
                  close();
                  focusTrigger(which);
                }}
              >
                ×
              </button>
            </div>
            <div className="mega-list">
              {(platform ? platformLinks : technologyLinks).map(
                ([name, href, description]) => (
                  <SiteLink className="mega-item" key={href} href={href}>
                    <span>
                      <strong>{name}</strong>
                      <span>{description}</span>
                    </span>
                    <span
                      className="arrow"
                      aria-hidden={platform ? true : undefined}
                    >
                      ↗
                    </span>
                  </SiteLink>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <header
      className={`site-header${compact ? " menu-compact" : ""}`}
      ref={ref}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !ref.current
            ?.querySelector(".mega.open")
            ?.contains(document.activeElement)
        )
          setMenu(null);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          close();
      }}
      onClick={(event) => {
        if ((event.target as Element).closest("a")) close();
      }}
    >
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Ana menü">
          {navigation.map(([key, label, href]) =>
            key === "platforms" || key === "tech" ? (
              <Fragment key={key}>{disclosure(key)}</Fragment>
            ) : (
              <SiteLink
                className={`nav-link ${active(key) ? "active" : ""}`}
                key={key}
                href={href}
                aria-current={page === key ? "page" : undefined}
              >
                {label}
              </SiteLink>
            ),
          )}
        </nav>
        <div className="header-tools">
          <LanguagePicker />
        </div>
        <button
          className="mobile-trigger"
          id="mobile-trigger"
          type="button"
          aria-label={menu === "mobile" ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={menu === "mobile"}
          aria-controls="mobile-nav"
          onClick={() => {
            setMenu(menu === "mobile" ? null : "mobile");
            setSub(null);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
      {mega("platforms")}
      {mega("tech")}
      <nav
        className={`mobile-nav${menu === "mobile" ? " open" : ""}`}
        id="mobile-nav"
        aria-label="Mobil menü"
        inert={menu !== "mobile"}
      >
        {navigation.map(([key, label, href]) =>
          key === "platforms" || key === "tech" ? (
            <Fragment key={key}>
              {disclosure(key, true)}
              <div
                id={key === "platforms" ? "mobile-platform-sub" : "mobile-sub"}
                className="mobile-sub"
                hidden={sub !== key}
              >
                {(key === "platforms" ? platformLinks : technologyLinks).map(
                  ([name, to]) => (
                    <SiteLink href={to} key={to}>
                      {name}
                    </SiteLink>
                  ),
                )}
              </div>
            </Fragment>
          ) : (
            <SiteLink key={key} href={href}>
              {label}
              <span>↗</span>
            </SiteLink>
          ),
        )}
      </nav>
    </header>
  );
}
