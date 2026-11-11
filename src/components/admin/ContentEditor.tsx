"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveContent, changeStatus } from "@/app/admin/actions";
import type { ContentBody } from "@/lib/cms/model";
export type ContentDocument = {
  id: string;
  kind: string;
  body: ContentBody;
  revision: number;
  approval: string;
  status: string;
};
export function ContentEditor({
  document,
  creationId,
  kind,
  versions = [],
  publisher = false,
  statusOnly = false,
  externalDirty = false,
}: {
  document?: ContentDocument;
  creationId?: string;
  kind: string;
  versions?: { revision: number; created_at: string }[];
  publisher?: boolean;
  statusOnly?: boolean;
  externalDirty?: boolean;
}) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [state, save, pending] = useActionState(
    async (
      previous: { message: string; ok?: boolean; id?: string },
      form: FormData,
    ) => {
      const result = await saveContent(previous, form);
      if (result.ok) setDirty(false);
      return result;
    },
    { message: "" },
  );
  const [status, change, changing] = useActionState(changeStatus, {
    message: "",
  });
  const [preview, setPreview] = useState(false),
    [body, setBody] = useState<ContentBody>(
      document?.body || {
        title: "",
        summary: "",
        paragraphs: [],
        date: null,
        source: null,
        stage: null,
      },
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
    if (state.ok) {
      if (state.id) router.replace(`/admin/content/${state.id}`);
      router.refresh();
    }
  }, [state, router]);
  useEffect(() => {
    if (status.ok) router.refresh();
  }, [status, router]);
  const update = (
    key: keyof ContentBody,
    value: ContentBody[keyof ContentBody],
  ) => {
    setDirty(true);
    setBody((b) => ({ ...b, [key]: value }));
  };
  return (
    <>
      <p>
        Kayıtlar önce taslak olarak saklanır; onay ve yayın ayrı işlemlerdir.
      </p>
      {!statusOnly && (
        <form action={save}>
          <fieldset disabled={pending}>
            <input type="hidden" name="id" value={document?.id || ""} />
            <input type="hidden" name="creationId" value={creationId || ""} />
            <input
              type="hidden"
              name="revision"
              value={document?.revision || 0}
            />
            <input type="hidden" name="kind" value={kind} />
            <label>
              Başlık
              <input
                name="title"
                value={body.title}
                maxLength={160}
                required
                onChange={(e) => update("title", e.target.value)}
              />
            </label>
            <label>
              Kısa açıklama
              <textarea
                name="summary"
                value={body.summary}
                maxLength={1000}
                onChange={(e) => update("summary", e.target.value)}
              />
            </label>
            <label>
              İçerik (paragraflar arasında boş satır bırakın)
              <textarea
                name="paragraphs"
                rows={12}
                value={body.paragraphs.join("\n\n")}
                onChange={(e) =>
                  update("paragraphs", e.target.value.split("\n\n"))
                }
              />
            </label>
            <label>
              Tarih (bilinmiyorsa boş bırakın)
              <input
                name="date"
                type="date"
                value={body.date || ""}
                onChange={(e) => update("date", e.target.value || null)}
              />
            </label>
            <label>
              Kaynak bağlantısı
              <input
                name="source"
                type="url"
                value={body.source || ""}
                onChange={(e) => update("source", e.target.value || null)}
              />
            </label>
            <label>
              Çalışmanın aşaması
              <input
                name="stage"
                value={body.stage || ""}
                maxLength={100}
                onChange={(e) => update("stage", e.target.value || null)}
              />
            </label>
            <div className="actions">
              <button disabled={pending}>Taslak kaydet</button>
              <button type="button" onClick={() => setPreview(!preview)}>
                Metni önizle
              </button>
              <Link
                href="/admin"
                onClick={(e) => {
                  if (
                    dirty &&
                    !window.confirm(
                      "Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?",
                    )
                  )
                    e.preventDefault();
                }}
              >
                Listeye dön
              </Link>
            </div>
            <p role="status">{state.message}</p>
          </fieldset>
        </form>
      )}
      {preview && (
        <article aria-label="Metin önizlemesi">
          <small>Metin önizlemesi — kurumsal sayfa şablonu değildir</small>
          <h2>{body.title}</h2>
          <p>{body.summary}</p>
          {body.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      )}
      {document && (
        <>
          <p>
            Durum:{" "}
            {
              (
                {
                  draft: "Taslak",
                  in_review: "İncelemede",
                  approved: "Onaylı",
                  published: "Yayın deposunda",
                  archived: "Arşivde",
                } as Record<string, string>
              )[document.status]
            }
          </p>
          <form action={change}>
            <input type="hidden" name="id" value={document.id} />
            <input type="hidden" name="revision" value={document.revision} />
            <div className="actions">
              <button
                name="operation"
                value="review"
                disabled={dirty || externalDirty || changing}
              >
                İncelemeye gönder
              </button>
              {publisher && (
                <>
                  <button
                    name="operation"
                    value="approve"
                    disabled={dirty || externalDirty || changing}
                  >
                    İçeriği onayla
                  </button>
                  <button
                    name="operation"
                    value="publish"
                    disabled={
                      dirty ||
                      externalDirty ||
                      changing ||
                      document.approval !== "approved"
                    }
                  >
                    Yayın deposuna al
                  </button>
                  <button
                    name="operation"
                    value="archive"
                    disabled={dirty || externalDirty || changing}
                    onClick={(e) => {
                      if (
                        !confirm(
                          "İçeriği yayın deposundan kaldırıp arşivlemek istiyor musunuz?",
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    Arşivle
                  </button>
                </>
              )}
            </div>
            <label>
              Geçmiş sürüm
              <select name="version">
                {versions.map((v) => (
                  <option key={v.revision} value={v.revision}>
                    {new Date(v.created_at).toLocaleString("tr-TR")} — sürüm{" "}
                    {v.revision}
                  </option>
                ))}
              </select>
            </label>
            <button
              name="operation"
              value="restore"
              disabled={dirty || externalDirty || changing || !versions.length}
            >
              Taslak olarak geri al
            </button>
            <p role="status">{status.message}</p>
          </form>
        </>
      )}
    </>
  );
}
