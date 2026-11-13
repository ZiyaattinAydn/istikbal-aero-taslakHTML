/**
 * Client-side re-encoding before any upload. Exif/metadata is discarded,
 * megapixel and byte limits are enforced, and uploaded media is WebP only.
 */
export async function prepareWebp(input: File): Promise<File> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(input.type) ||
    !input.size ||
    input.size > 15 * 1024 * 1024
  ) throw Error("PNG, JPEG veya WebP seçin (en fazla 15 MB).");
  const bitmap = await createImageBitmap(input);
  try {
    if (bitmap.width * bitmap.height > 24_000_000)
      throw Error("Görsel en fazla 24 megapiksel olabilir.");
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Görsel işlenemedi.");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (file) => file ? resolve(file) : reject(Error("Dönüştürme başarısız.")),
        "image/webp",
        0.82,
      ),
    );
    if (blob.type !== "image/webp" || !blob.size || blob.size > 5 * 1024 * 1024)
      throw Error("Görsel dönüştürülemedi veya çok büyük.");
    return new File([blob], "image.webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}
