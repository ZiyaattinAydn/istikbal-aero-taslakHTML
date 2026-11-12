import { imageSize } from "image-size";
import { validateUpload } from "./model";
export function inspectMedia(bytes: Uint8Array, mime: string) {
  validateUpload(bytes, mime);
  if (mime !== "image/webp")
    throw Error("Görseli yüklemeden önce WebP biçimine dönüştürün.");
  const dimensions = imageSize(bytes);
  const { width, height, type } = dimensions;
  if (
    type !== "webp" ||
    !width ||
    !height ||
    width > 6000 ||
    height > 6000 ||
    width * height > 24_000_000
  )
    throw Error(
      "Görsel boyutları en fazla 6000 piksel ve toplam 24 megapiksel olabilir.",
    );
  return { width, height };
}
