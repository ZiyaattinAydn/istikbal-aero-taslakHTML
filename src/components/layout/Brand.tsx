import { SiteLink } from "@/components/ui/SiteLink";
export function Brand() {
  return (
    <SiteLink
      className={"brand"}
      href={"index.html"}
      aria-label={"İstikbal Aerospace ana sayfa"}
    >
      <span className={"logo-mark"}>
        <svg viewBox={"0 0 40 40"} aria-hidden={"true"} focusable={"false"}>
          <path d={"M20 3.5 36 12.4 20 21.3 4 12.4Z"} fill={"#35b7e6"}></path>
          <path
            d={"m4 18.1 16 8.8 16-8.8v5.9L20 32.8 4 24Z"}
            fill={"#35b7e6"}
          ></path>
          <path
            d={"m4 26 16 8.8L36 26v5.7L20 40.2 4 31.7Z"}
            fill={"#35b7e6"}
          ></path>
        </svg>
      </span>
      <span className={"brand-text"}>{"İSTİKBAL AEROSPACE"}</span>
    </SiteLink>
  );
}
