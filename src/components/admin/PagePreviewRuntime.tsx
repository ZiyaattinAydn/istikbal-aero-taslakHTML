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
    Object.entries(values).map(([key, value]) =>
      [key, asPreviewMedia(typeof value === "string" ? value : "")]),
  );
}

/**
 * The real public page components are rendered by React, using the latest
 * unsaved field values delivered from the same-origin, authenticated editor.
 * Direct DOM text mutations are intentionally NOT used: React hydration and
 * client components can replace those nodes after they have been selected.
 *
 * This component lives exclusively on the AAL2-protected admin preview route.
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
  const [syncCount, setSyncCount] = useState(0);
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
      setSyncCount((count) => count + 1);
      setLiveValues((previous) => {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
          if (previous[key] !== value) {
            changed = true;
            break;
          }
        }
        if (!changed) return previous;
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
      {/* Diagnostics expose only counts/boolean state, never content or credentials. */}
      <span hidden data-cms-preview-runtime
        data-cms-preview-syncs={syncCount}
        data-cms-preview-dirty={fields.some((field) =>
          liveValues[field.key] !== asPreviewMedia(initialValues[field.key] ?? ""),
        ) ? "true" : "false"} />
      <PagePreviewBridge fields={fields} values={initialValues} />
    </>
  );
}
