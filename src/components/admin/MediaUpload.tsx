"use client";
import { useActionState, useRef, useState } from "react";
import { uploadMedia } from "@/app/admin/media/actions";
import { prepareWebp } from "@/lib/cms/prepare-webp";
export function MediaUpload() {
  const [state, action, pending] = useActionState(uploadMedia, { message: "" });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function convert(input: File) {
    setBusy(true);
    setError("");
    try {
      setFile(await prepareWebp(input));
    } catch (e) {
      setFile(undefined);
      setError(e instanceof Error ? e.message : "Dönüştürülemedi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      ref={form}
      action={async (data) => {
        if (file) data.set("file", file);
        action(data);
      }}
    >
      <fieldset disabled={pending || busy}>
        <label>
          Görsel
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (e.target.files?.[0]) void convert(e.target.files[0]);
            }}
            required
          />
        </label>
        <small>
          WebP’ye dönüştürülür, en uzun kenarı 2000 piksele indirilir ve
          metadata yeniden kodlama ile çıkarılır.
        </small>
        <label>
          Görsel açıklaması
          <input name="alt" maxLength={300} required />
        </label>
        <label>
          <input type="checkbox" name="rights" required /> Bu görseli kullanma
          ve yayımlama iznim var.
        </label>
        <button disabled={!file || busy || pending}>
          Özel kütüphaneye yükle
        </button>
        <p role="status">
          {busy ? "Görsel hazırlanıyor…" : error || state.message}
        </p>
      </fieldset>
    </form>
  );
}
