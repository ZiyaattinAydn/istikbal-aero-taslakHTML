"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { uploadMedia } from "@/app/admin/media/actions";
import {
  mediaThumbnail, siteMedia, type CmsMediaOption,
} from "@/lib/cms/site-media";
import { prepareWebp } from "@/lib/cms/prepare-webp";

type Props = {
  id: string;
  value: string;
  media: CmsMediaOption[];
  onChange: (value: string) => void;
  onFocus?: () => void;
  includeSite?: boolean;
  allowEmpty?: boolean;
};

export function ImageFieldPicker({
  id,
  value,
  media,
  onChange,
  onFocus,
  includeSite = true,
  allowEmpty = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<CmsMediaOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [rights, setRights] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const uploaded = useMemo(() => {
    const index = new Map(media.map((item) => [item.id, item]));
    for (const item of added) index.set(item.id, item);
    return [...index.values()];
  }, [media, added]);
  const current = uploaded.find((item) => "cms:" + item.id === value);
  const siteCurrent = siteMedia.find((item) => item.name === value);
  const label = current?.alt || siteCurrent?.label || (value ? "Kayıtlı görsel" : "Görsel seçilmedi");
  const thumb = mediaThumbnail(value);
  const term = search.trim().toLocaleLowerCase("tr-TR");
  const matches = (text: string) => text.toLocaleLowerCase("tr-TR").includes(term);
  const choices = includeSite ? siteMedia.filter((item) =>
    matches(item.label + " " + item.category + " " + item.name),
  ) : [];
  const managed = uploaded.filter((item) => matches(item.alt));

  const pick = (next: string) => {
    onChange(next);
    setExpanded(false);
    setNotice("");
    setError("");
  };

  const convert = async (input?: File) => {
    setError("");
    setNotice("");
    setFile(null);
    if (!input) return;
    setProcessing(true);
    try {
      setFile(await prepareWebp(input));
      if (!alt.trim()) setAlt(input.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").slice(0,300));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel hazırlanamadı.");
    } finally {
      setProcessing(false);
    }
  };

  const uploadHere = async () => {
    if (!file || !alt.trim() || !rights || processing || uploading) {
      setError("Görseli, açıklamasını ve kullanım iznini kontrol edin.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", alt.trim());
      form.set("rights", "on");
      // This is the existing authenticated server action, not a client-side
      // Storage upload. It always creates a private library entry first.
      const result = await uploadMedia({ message: "" }, form);
      if (!result.ok || !("id" in result) || !result.id) {
        throw Error(result.message || "Görsel yüklenemedi.");
      }
      setAdded((items) => [...items, {
        id: result.id,
        alt: alt.trim(),
        visibility: "private",
      }]);
      setNotice("Görsel özel kütüphaneye yüklendi ve bu alana seçildi. Sayfa taslağını kaydedin.");
      setFile(null);
      setRights(false);
      onChange("cms:" + result.id);
      setExpanded(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme tamamlanamadı.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cms-image-picker" data-image-picker={id}>
      <div className="cms-image-selected">
        {thumb ? (
          <Image unoptimized src={thumb} alt={label} width={176} height={104}
            loading="lazy" className="cms-image-thumb" />
        ) : (
          <div className="cms-image-placeholder" role="img" aria-label="Görsel seçilmedi">▧</div>
        )}
        <div className="cms-image-selected-text">
          <strong>{label}</strong>
          <small>{value.startsWith("cms:") ?
            (current?.visibility === "public" ? "Yayın izni açık" : "Özel görsel · yayın izni gerekli") :
            value ? "Sitenin mevcut görseli" : "Kapak seçilmedi"}</small>
          <button id={id} type="button" className="cms-image-open"
            aria-expanded={expanded}
            aria-controls={id + "-options"}
            disabled={processing || uploading}
            onClick={() => { onFocus?.(); setExpanded((open) => !open); }}>
            {expanded ? "Seçimi kapat" : "Görsel seç veya yükle"}
          </button>
          {allowEmpty && value && (
            <button type="button" className="cms-image-remove" onClick={() => pick("")}>
              Kapak kullanma
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div id={id + "-options"} className="cms-image-browser">
          <label>
            Kütüphanede ara
            <input type="search" value={search} maxLength={100}
              onChange={(e) => setSearch(e.target.value)} placeholder="Görsel adı..." />
          </label>
          <div className="cms-image-options" role="group" aria-label="Görsel seçenekleri">
            {choices.map((item) => (
              <button type="button" key={item.name} onClick={() => pick(item.name)}
                aria-label={item.label + " görselini seç"}
                aria-pressed={value === item.name} className={value === item.name ? "is-selected" : ""}>
                <Image unoptimized src={"/assets/" + item.name} alt="" width={134} height={82} loading="lazy" />
                <span>{item.label}</span>
                <small>Sitede mevcut</small>
              </button>
            ))}
            {managed.map((item) => (
              <button type="button" key={item.id} onClick={() => pick("cms:" + item.id)}
                aria-label={item.alt + " görselini seç"}
                aria-pressed={value === "cms:" + item.id}
                className={value === "cms:" + item.id ? "is-selected" : ""}>
                <Image unoptimized src={"/admin/media/" + item.id + "/file"} alt=""
                  width={134} height={82} loading="lazy" />
                <span>{item.alt}</span>
                <small>{item.visibility === "public" ? "Yayın izni açık" : "Özel"}</small>
              </button>
            ))}
          </div>
          {choices.length + managed.length === 0 && (
            <p>Aramanızla eşleşen görsel bulunamadı. Aşağıdan yeni görsel yükleyebilirsiniz.</p>
          )}

          <div className="cms-image-upload">
            <strong>Bilgisayarımdan yeni görsel yükle</strong>
            <p>Kütüphaneye önceden eklemeniz gerekmez. JPEG, PNG veya WebP dosyası güvenli şekilde WebP biçimine dönüştürülür.</p>
            <label>
              Görsel dosyası
              <input type="file" accept="image/png,image/jpeg,image/webp"
                disabled={processing || uploading}
                onChange={(event) => { void convert(event.target.files?.[0]); }} />
            </label>
            <label>
              Yeni görselin açıklaması
              <input type="text" value={alt} maxLength={300}
                disabled={processing || uploading}
                onChange={(event) => setAlt(event.target.value)} />
            </label>
            <label className="cms-image-rights">
              <input type="checkbox" checked={rights} disabled={processing || uploading}
                onChange={(event) => setRights(event.target.checked)} />
              Bu görseli kullanma ve yayımlama iznim var.
            </label>
            <button type="button" className="cms-image-upload-button"
              disabled={!file || !alt.trim() || !rights || processing || uploading}
              onClick={() => { void uploadHere(); }}>
              {processing ? "Görsel hazırlanıyor..." : uploading ? "Yükleniyor..." : "Yükle ve bu görseli seç"}
            </button>
            <p className="cms-image-safety-note">
              Yeni yüklemeler önce özel saklanır. Yayında kullanmak için{" "}
              <Link href="/admin/media" target="_blank" rel="noopener noreferrer">
                medya kütüphanesinden
              </Link>{" "}
              herkese açık kullanım izni verilmelidir.
            </p>
          </div>
        </div>
      )}
      {(error || notice) && (
        <p role="status" className={error ? "cms-image-error" : "cms-image-success"}>
          {error || notice}
        </p>
      )}
    </div>
  );
}
