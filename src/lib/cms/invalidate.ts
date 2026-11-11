import "server-only";
import { updateTag } from "next/cache";
export function invalidateDocument(item: {
  id: string;
  kind: string;
  slug: string;
}) {
  updateTag(
    item.kind === "page" ? `cms-page-${item.slug}` : `cms-list-${item.kind}`,
  );
  if (item.kind !== "page") updateTag(`cms-item-${item.kind}-${item.slug}`);
  updateTag(`cms-reference-${item.id}`);
}
