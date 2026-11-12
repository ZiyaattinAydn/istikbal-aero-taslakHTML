"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageContent } from "@/components/pages/PageContent";
import { PagePreviewBridge } from "./PagePreviewBridge";
import type { PageId } from "@/data/routes";
import type { PageField, PageValues } from "@/lib/cms/page-values";

const CHANNEL = "istikbal:visual-editor:v1";

function asPreviewMedia(value: string) {
  return /^cms:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
    ? "cms-preview:" + value.slice(4)
    : value;
}

function previewValues(values: PageValues): PageValues {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key, asPreviewMedia(typeof value === "string" ? value : ""),
    ]),
  );
}

/**
 * Render actual page components with unsaved values through React.
 * Keep the DOM inspector separate from rendering; do not rewrite DOM markup.
 * Only the same-origin authenticated parent frame can update field values.
 */
export function PagePreviewRuntime({
  page,
  fields,
  initialValues,
}: {
  page: PageId;
  fields: PageField[];
  initialValues: PageValues;
}) {
  const [liveValues, setLiveValues] = useState<PageValues>(() => previewValues(initialValues));
  const allowed = useMemo(() => new Set(fields.map((field) => field.key)), [fields]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent ||
          event.origin !== window.location.origin) return;
      const message = event.data;
      if (!message || message.channel !== CHANNEL || message.kind !== "sync" ||
          !message.values || typeof message.values !== "object" ||
          Array.isArray(message.values)) return;

      const updates: PageValues = {};
      for (const [key, raw] of Object.entries(message.values)) {
        if (!allowed.has(key) || typeof raw !== "string" || raw.length > 8000) continue;
        updates[key] = asPreviewMedia(raw);
      }
      setLiveValues((previous) => {
        if (Object.entries(updates).every(([key, value]) => previous[key] === value))
          return previous;
        return { ...previous, ...updates };
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [allowed]);

  return (
    <>
      <SiteShell page={page}>
        <PageContent page={page} content={liveValues} />
      </SiteShell>
      <PagePreviewBridge fields={fields} values={liveValues} />
    </>
  );
}
