"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentEditor, type ContentDocument } from "./ContentEditor";
import { savePage } from "@/app/admin/pages/actions";
import type { PageField, PageValues } from "@/lib/cms/page-values";

const CHANNEL = "istikbal:visual-editor:v1";

export function PageEditor({
  slug,
  revision,
  title,
  summary,
  fields,
  values,
  media = [],
  record,
  versions = [],
  publisher = false,
}: {
  slug: string;
  revision: number;
  title: string;
  summary: string;
  fields: PageField[];
  values: PageValues;
  record?: ContentDocument;
  versions?: { revision: number; created_at: string }[];
  publisher?: boolean;
  media?: { id: string; alt: string; visibility: string }[];
}) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [dirty, setDirty] = useState(false);
  const [current, setCurrent] = useState(values);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [match, setMatch] = useState<"ready" | "found" | "missing">("ready");

  const [state, action, pending] = useActionState(
    async (prev: { message: string; ok?: boolean }, form: FormData) => {
      const result = await savePage(prev, form);
      if (result.ok) setDirty(false);
      return result;
    },
    { message: "" },
  );

  useEffect(() => {
    const before = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const sendPreview = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { channel: CHANNEL, kind: "sync", values: current, selected },
      window.location.origin,
    );
  };

  useEffect(() => {
    if (previewOpen) sendPreview();
    // Sync is intentionally repeated when a text field or selected field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, selected, previewOpen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) return;
      const message = event.data;
      if (!message || message.channel !== CHANNEL) return;
      if (message.kind === "ready") sendPreview();
      if (message.kind === "match" && message.key === selected) {
        setMatch(message.found ? "found" : "missing");
      }
      if (message.kind === "edit") {
        const key = String(message.key || "");
        if (!fields.some((field) => field.key === key)) return;
        setSelected(key);
        setMatch("ready");
        const element = [...document.querySelectorAll<HTMLElement>("[data-cms-field-key]")]
          .find((el) => el.dataset.cmsFieldKey === key);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.querySelector<HTMLTextAreaElement | HTMLSelectElement>("textarea,select")?.focus();
        } else {
          setQuery("");
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // sendPreview captures the current text values for the initial iframe ready event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, selected, fields]);

  const update = (key: string, value: string) => {
    setCurrent((previous) => ({ ...previous, [key]: value }));
    setDirty(true);
  };

  const showField = (key: string) => {
    setPreviewOpen(true);
    setSelected(key);
    setMatch("ready");
  };

  const visibleFields = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) =>
      !query ||
      (current[field.key] ?? field.value)
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")) ||
      field.label.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
    );

  return (
    <>
      <div className="cms-visual-editor">
        <div className="cms-editor-fields">
          <div className="cms-editor-help">
            <strong>Görsel içerik düzenleme</strong>
            <p>Alanı seçin veya “Sayfada göster” düğmesine basın. Sağda ilgili yeri göreceksiniz. Metin değişiklikleri kaydedilmeden önizlemede görünür; herkese açık site değişmez.</p>
          </div>
          <div className="cms-editor-search">
            <label htmlFor="cms-field-search">Sayfadaki alanlarda ara</label>
            <input
              id="cms-field-search"
              type="search"
              value={query}
              placeholder="Metin, başlık veya içerikte ara..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <form action={action} className="cms-page-form">
            <fieldset disabled={pending}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="revision" value={revision} />
              <input type="hidden" name="fields" value={JSON.stringify(current)} />

              <div className="cms-page-seo">
                <div className="cms-editor-subtitle">Sayfa SEO bilgileri</div>
                <label>
                  Arama motoru başlığı
                  <input
                    name="title"
                    defaultValue={title}
                    required
                    maxLength={160}
                    onChange={() => setDirty(true)}
                  />
                </label>
                <label>
                  Arama motoru açıklaması
                  <textarea
                    name="summary"
                    defaultValue={summary}
                    maxLength={1000}
                    onChange={() => setDirty(true)}
                  />
                </label>
              </div>

              <div className="cms-editor-subtitle">
                Sayfa içeriği <span>{visibleFields.length} / {fields.length} alan</span>
              </div>
              <div className="cms-fields-list">
                {visibleFields.map(({ field, index }) => {
                  const previewText = (current[field.key] ?? field.value)
                    .replace(/\s+/g, " ")
                    .trim();
                  const id = "cms-content-field-" + index;
                  return (
                    <div
                      key={field.key}
                      className={"cms-edit-field" + (selected === field.key ? " is-selected" : "")}
                      data-cms-field-key={field.key}
                    >
                      <div className="cms-edit-field-top">
                        <label htmlFor={id}>{index + 1}. {field.label}</label>
                        <button
                          type="button"
                          className="cms-locate-button"
                          onClick={() => showField(field.key)}
                          aria-label={index + 1 + ". alanı sayfada göster"}
                        >◎ Sayfada göster</button>
                      </div>
                      <p className="cms-field-context" title={previewText}>
                        {field.kind === "image"
                          ? "Sayfadaki görsel alanı"
                          : field.kind === "link"
                            ? "Sayfadaki bağlantı"
                            : previewText || "Boş metin alanı"}
                      </p>
                      {field.kind === "image" ? (
                        <select
                          id={id}
                          data-field={field.key}
                          value={current[field.key] ?? field.value}
                          onFocus={() => showField(field.key)}
                          onChange={(event) => update(field.key, event.target.value)}
                        >
                          <option value={field.value}>Mevcut görsel</option>
                          {media.map((item) => (
                            <option key={item.id} value={"cms:" + item.id}>
                              {item.alt}
                              {item.visibility === "private" ? " (özel — yayın öncesi açılmalı)" : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <textarea
                          id={id}
                          data-field={field.key}
                          rows={field.value.length > 160 ? 4 : 2}
                          value={current[field.key] ?? field.value}
                          maxLength={8000}
                          onFocus={() => showField(field.key)}
                          onChange={(event) => update(field.key, event.target.value)}
                        />
                      )}
                      {selected === field.key && (
                        <small className="cms-field-match" role="status">
                          {match === "found"
                            ? "✓ Bu alan sağdaki sayfada işaretlendi."
                            : match === "missing"
                              ? "Bu alan önizlemede otomatik bulunamadı; metin farklı bölümlerde kullanılıyor olabilir."
                              : "Sayfadaki konumu aranıyor..."}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="cms-editor-actions">
                <button className="cms-primary-btn" disabled={pending}>
                  {pending ? "Kaydediliyor..." : "Taslak kaydet"}
                </button>
                <Link
                  href={"/admin/pages/" + slug + "/preview"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tam sayfa önizle ↗
                </Link>
                <Link
                  href="/admin/pages"
                  onClick={(event) => {
                    if (dirty && !window.confirm("Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?"))
                      event.preventDefault();
                  }}
                >
                  Sayfalara dön
                </Link>
              </div>
              <p role="status" className="cms-form-status">{state.message}</p>
              {dirty && <p className="cms-unsaved-note">Kaydedilmemiş değişiklikler önizlemede görünebilir; başka sekmede önizlemek ve yayınlamak için önce taslağı kaydedin.</p>}
            </fieldset>
          </form>
        </div>

        <aside className="cms-editor-preview" aria-label="Görsel sayfa önizlemesi">
          <div className="cms-preview-heading">
            <div>
              <span className="cms-eyebrow">GERÇEK SAYFA TASARIMI</span>
              <strong>Görsel önizleme</strong>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen((previous) => !previous)}
              aria-expanded={previewOpen}
            >{previewOpen ? "Gizle" : "Göster"}</button>
          </div>
          <p className="cms-preview-guidance">
            Metne tıklayınca editördeki alan açılır. Buradaki değişiklikler <strong>yayınlanmaz.</strong>
          </p>
          {previewOpen && (
            <iframe
              ref={iframeRef}
              title="Yalnızca yöneticiye açık gerçek sayfa önizlemesi"
              src={"/admin/pages/" + encodeURIComponent(slug) + "/preview"}
              className="cms-visual-preview-frame"
              onLoad={sendPreview}
            />
          )}
          <div className="cms-preview-footer">
            <span className="cms-online-dot" /> GÜVENLİ TASLAK ÖNİZLEMESİ
          </div>
        </aside>
      </div>
      {record && (
        <div className="cms-visual-editor-status">
          <ContentEditor
            statusOnly
            document={record}
            kind="page"
            versions={versions}
            publisher={publisher}
            externalDirty={dirty}
          />
        </div>
      )}
    </>
  );
}
