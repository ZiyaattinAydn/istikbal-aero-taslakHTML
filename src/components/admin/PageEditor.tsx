"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentEditor, type ContentDocument } from "./ContentEditor";
import { savePage } from "@/app/admin/pages/actions";
import type { PageField, PageValues } from "@/lib/cms/page-values";
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
  const [dirty, setDirty] = useState(false);
  const [current, setCurrent] = useState(values);
  const [query, setQuery] = useState("");
  const [state, action, pending] = useActionState(
    async (prev: { message: string; ok?: boolean }, form: FormData) => {
      const result = await savePage(prev, form);
      if (result.ok) setDirty(false);
      return result;
    },
    { message: "" },
  );
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);
  const update = (key: string, value: string) => {
    setCurrent((v) => ({ ...v, [key]: value }));
    setDirty(true);
  };
  return (
    <>
      <p>
        Alanlar özgün sayfa şablonundaki metin ve görsellere bağlıdır. Düzen ve
        animasyonlar sabittir.
      </p>
      <label>
        Alan ara
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <form action={action}>
        <fieldset disabled={pending}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="revision" value={revision} />
          <input type="hidden" name="fields" value={JSON.stringify(current)} />
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
          {fields
            .filter(
              (f) =>
                !query ||
                (current[f.key] ?? f.value)
                  .toLocaleLowerCase("tr")
                  .includes(query.toLocaleLowerCase("tr")) ||
                f.label
                  .toLocaleLowerCase("tr")
                  .includes(query.toLocaleLowerCase("tr")),
            )
            .map((field, index) => (
              <label key={field.key}>
                {index + 1}. {field.label}
                {field.kind === "image" ? (
                  <select
                    value={current[field.key] ?? field.value}
                    onChange={(e) => update(field.key, e.target.value)}
                  >
                    <option value={field.value}>Mevcut görsel</option>
                    {media.map((m) => (
                      <option key={m.id} value={`cms:${m.id}`}>
                        {m.alt}
                        {m.visibility === "private"
                          ? " (özel — yayın öncesi açılmalı)"
                          : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    rows={field.value.length > 160 ? 4 : 2}
                    value={current[field.key] ?? field.value}
                    maxLength={8000}
                    onChange={(e) => update(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          <div className="actions">
            <button disabled={pending}>Taslak kaydet</button>
            {!dirty && (
              <Link href={`/admin/pages/${slug}/preview`} target="_blank">
                Gerçek şablonda önizle
              </Link>
            )}
            <Link
              href="/admin/pages"
              onClick={(e) => {
                if (
                  dirty &&
                  !confirm(
                    "Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?",
                  )
                )
                  e.preventDefault();
              }}
            >
              Sayfalara dön
            </Link>
          </div>
          <p role="status">{state.message}</p>
          {dirty && <p>Önizleme ve yayın için önce taslağı kaydedin.</p>}
        </fieldset>
      </form>
      {record && (
        <ContentEditor
          statusOnly
          document={record}
          kind="page"
          versions={versions}
          publisher={publisher}
          externalDirty={dirty}
        />
      )}
    </>
  );
}
