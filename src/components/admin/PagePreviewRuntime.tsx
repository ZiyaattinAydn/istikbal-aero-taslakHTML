"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageContent } from "@/components/pages/PageContent";
import { PagePreviewBridge, findFieldTargets } from "./PagePreviewBridge";
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
  // The cinematic page has imperative reveal/motion bindings. Remount the
  // preview subtree on a content change to avoid reusing a text node React no
  // longer owns; the inspector must bind to the same latest render.
  const renderKey = useMemo(() => JSON.stringify(
    fields.map((field) => liveValues[field.key] ?? field.value),
  ), [fields, liveValues]);

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

  useLayoutEffect(() => {
    const root = document.getElementById("main");
    if (!root) return;
    const targets = findFieldTargets(root, fields, initialValues);
    for (const [key, target] of targets) {
      const live = liveValues[key];
      const originalValue = initialValues[key] ?? target.field.value;
      if (target.field.kind !== "text" || typeof live !== "string" ||
          live === originalValue || !target.textNode || !target.originalText ||
          !root.contains(target.textNode)) continue;
      // Only a uniquely matched real Text node is writable. React has just
      // committed this subtree; apply unsaved text before the browser paints.
      const original = target.originalText;
      target.textNode.data = original.includes(target.source)
        ? original.replace(target.source, live)
        : original.trim() === target.source.trim() ? live : original;
    }
  }, [fields, initialValues, liveValues, renderKey]);

  return (
    <>
      <SiteShell page={page}>
        <PageContent key={renderKey} page={page} content={liveValues} />
      </SiteShell>
      {/* Diagnostics expose only counts/boolean state, never content or credentials. */}
      <span hidden data-cms-preview-runtime
        data-cms-preview-syncs={syncCount}
        data-cms-preview-title-changed={
          liveValues["NewsContent.title.0"] !== asPreviewMedia(initialValues["NewsContent.title.0"] ?? "")
            ? "true" : "false"
        }
        data-cms-preview-dirty={fields.some((field) =>
          liveValues[field.key] !== asPreviewMedia(initialValues[field.key] ?? ""),
        ) ? "true" : "false"} />
      <PagePreviewBridge key={renderKey} fields={fields} values={liveValues} />
    </>
  );
}
