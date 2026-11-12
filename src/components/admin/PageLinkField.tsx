"use client";

import { routes } from "@/data/routes";

const homepageFile = routes.find((route) => route.slug === "index")!.file;

export function PageLinkField({
  id,
  value,
  onChange,
  onFocus,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  onFocus: () => void;
}) {
  const page = routes.find((route) => value === route.file || value.startsWith(route.file + "?id="));
  const type = page ? "page" : value.startsWith("mailto:") ? "email" :
    value.startsWith("tel:") ? "phone" : "external";
  const setType = (next: string) => {
    if (next === "page") onChange(homepageFile);
    if (next === "external") onChange("https://");
    if (next === "email") onChange("mailto:");
    if (next === "phone") onChange("tel:");
  };

  return (
    <div className="cms-link-editor">
      <select id={id} aria-label="Bağlantı türü" value={type}
        onFocus={onFocus} onChange={(event) => setType(event.target.value)}>
        <option value="page">Sitedeki sayfa</option>
        <option value="external">Dış internet adresi</option>
        <option value="email">E-posta adresi</option>
        <option value="phone">Telefon numarası</option>
      </select>
      {type === "page" ? (
        <select aria-label="Hedef sayfa" value={page?.file ?? routes[0].file}
          onFocus={onFocus} onChange={(event) => onChange(event.target.value)}>
          {routes.map((route) => (
            <option key={route.slug} value={route.file}>
              {route.title.split("|")[0].trim()}
            </option>
          ))}
        </select>
      ) : (
        <input
          aria-label={type === "email" ? "E-posta" : type === "phone" ? "Telefon" : "Güvenli web adresi"}
          type={type === "email" ? "email" : type === "phone" ? "tel" : "url"}
          value={type === "email" ? value.slice(7) : type === "phone" ? value.slice(4) : value}
          onFocus={onFocus}
          onChange={(event) => onChange(
            type === "email" ? "mailto:" + event.target.value :
            type === "phone" ? "tel:" + event.target.value : event.target.value,
          )}
          placeholder={type === "email" ? "ornek@firma.com" : type === "phone" ? "+90 ..." : "https://..."}
          maxLength={2048}
        />
      )}
    </div>
  );
}
