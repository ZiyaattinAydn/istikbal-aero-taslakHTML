"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { manageMedia } from "@/app/admin/media/actions";
export function MediaEditor({
  media,
  publisher,
}: {
  media: {
    id: string;
    alt: string;
    caption: string;
    revision: number;
    visibility: string;
  };
  publisher: boolean;
}) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [state, action, pending] = useActionState(manageMedia, {
    message: "",
    ok: false,
  });
  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state, router]);
  return (
    <form action={action} onChange={() => setDirty(true)}>
      <input type="hidden" name="id" value={media.id} />
      <input type="hidden" name="revision" value={media.revision} />
      <fieldset disabled={pending}>
        <label>
          Alternatif metin
          <input name="alt" defaultValue={media.alt} required maxLength={300} />
        </label>
        <label>
          Medya notu / kaynak ve kullanım bilgisi
          <textarea
            name="caption"
            defaultValue={media.caption}
            maxLength={1000}
          />
        </label>
        <button name="operation" value="metadata">
          Bilgileri kaydet
        </button>
        {publisher && (
          <div className="actions">
            {media.visibility === "private" ? (
              <button name="operation" value="allow" disabled={dirty}>
                Herkese açık kullanımını onayla
              </button>
            ) : (
              <>
                <label>
                  <input
                    type="checkbox"
                    name="withdraw"
                    onChange={(e) => e.stopPropagation()}
                  />
                  Görseli kullanan yayınları da taslağa almayı onaylıyorum.
                </label>
                <button
                  name="operation"
                  value="revoke"
                  disabled={dirty}
                  onClick={(e) => {
                    if (
                      !confirm(
                        "Yayın izni geri çekilecek. Gerekirse bağlı yayınlar taslağa alınır; içerik ve dosya silinmez. Devam edilsin mi?",
                      )
                    )
                      e.preventDefault();
                  }}
                >
                  Yayın iznini geri çek
                </button>
              </>
            )}
          </div>
        )}
        {dirty && <small>Önce bilgi değişikliklerini kaydedin.</small>}
        <p role="status">{state.message}</p>
      </fieldset>
    </form>
  );
}
