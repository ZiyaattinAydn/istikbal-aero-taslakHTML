"use client";
import { useActionState, useRef, useState } from "react";
import { uploadMedia } from "@/app/admin/media/actions";
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
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(input.type) ||
        input.size > 15 * 1024 * 1024
      )
        throw Error("PNG, JPEG veya WebP seçin (en fazla 15 MB).");
      const bitmap = await createImageBitmap(input);
      if (bitmap.width * bitmap.height > 24_000_000) {
        bitmap.close();
        throw Error("Görsel en fazla 24 megapiksel olabilir.");
      }
      const ratio = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * ratio);
      canvas.height = Math.round(bitmap.height * ratio);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error("Dönüştürme başarısız."))),
          "image/webp",
          0.82,
        ),
      );
      if (blob.type !== "image/webp" || blob.size > 5 * 1024 * 1024)
        throw Error("Görsel dönüştürülemedi veya çok büyük.");
      setFile(new File([blob], "image.webp", { type: "image/webp" }));
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
