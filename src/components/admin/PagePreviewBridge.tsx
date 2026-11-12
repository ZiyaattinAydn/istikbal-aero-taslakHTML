"use client";

import { useEffect, useState } from "react";
import { mediaUrl, safeLocalHref } from "@/lib/urls";
import type { PageField, PageValues } from "@/lib/cms/page-values";

const CHANNEL = "istikbal:visual-editor:v1";
type PreviewEntry = {
  field: PageField;
  source: string;
  element: HTMLElement;
  textNode?: Text;
  originalText?: string;
  originalStyle?: string | null;
  originalSrc?: string | null;
  originalHref?: string | null;
};

function findFieldTargets(root: HTMLElement, fields: PageField[], values: PageValues) {
  const entries = new Map<string, PreviewEntry>();
  const reservedText = new Set<Text>();
  const reservedElements = new Set<HTMLElement>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.parentElement && current.nodeValue?.trim()) {
      textNodes.push(current as Text);
    }
  }

  for (const field of fields) {
    const source = values[field.key] ?? field.value;
    if (!source?.trim()) continue;
    if (field.kind === "text") {
      // Explicit markers are preferred for short, repeated inline fragments.
      const marked = [...root.querySelectorAll<HTMLElement>("[data-cms-field]")]
        .find((element) => element.dataset.cmsField === field.key);
      if (marked) {
        const node = textNodes.find((candidate) => marked.contains(candidate) && candidate.data.includes(source));
        if (node) reservedText.add(node);
        entries.set(field.key, {
          field, source, element: marked,
          textNode: node,
          originalText: node?.data,
        });
        continue;
      }
      // Prefer exact React text nodes so short fragments such as "ile"
      // do not match longer unrelated copy elsewhere on the page.
      const available = textNodes.filter((node) => !reservedText.has(node));
      const match =
        available.find((node) => node.data === source) ??
        available.find((node) => node.data.trim() === source.trim()) ??
        available.find((node) => node.data.includes(source));
      const element = match?.parentElement;
      if (match && element) {
        reservedText.add(match);
        entries.set(field.key, {
          field, source, element, textNode: match, originalText: match.data,
        });
      }
      continue;
    }

    if (field.kind === "image") {
      const images = [...root.querySelectorAll<HTMLElement>("img,[style]")];
      const renderedImage = mediaUrl(
        source.startsWith("cms:") ? source.replace("cms:", "cms-preview:") : source,
      );
      const element = images.find((candidate) => {
        if (reservedElements.has(candidate)) return false;
        return (candidate.getAttribute("src") || "").includes(source) ||
          (candidate.getAttribute("style") || "").includes(source) ||
          (candidate.getAttribute("src") || "").includes(renderedImage) ||
          (candidate.getAttribute("style") || "").includes(renderedImage);
      });
      if (element) {
        reservedElements.add(element);
        entries.set(field.key, {
          field, source, element,
          originalStyle: element.getAttribute("style"),
          originalSrc: element.getAttribute("src"),
        });
      }
      continue;
    }

    if (field.kind === "link") {
      const links = [...root.querySelectorAll<HTMLAnchorElement>("a[href]")];
      const element = links.find((candidate) => {
        if (reservedElements.has(candidate)) return false;
        const href = candidate.getAttribute("href") || "";
        return href === source || href === safeLocalHref(source) || href.endsWith("/" + source);
      });
      if (element) {
        reservedElements.add(element);
        entries.set(field.key, { field, source, element, originalHref: element.getAttribute("href") });
      }
    }
  }
  return entries;
}

function applyPreview(entry: PreviewEntry, value: string) {
  if (entry.field.kind === "text" && entry.textNode && entry.originalText !== undefined) {
    // Modify only the matching text fragment; never write HTML into the preview.
    const original = entry.originalText;
    entry.textNode.data = original.includes(entry.source)
      ? original.replace(entry.source, value)
      : original.trim() === entry.source.trim() ? value : original;
  } else if (entry.field.kind === "image") {
    const safe = /^(?:[a-z0-9-]+\.(?:webp|svg)|cms:[0-9a-f-]{36})$/.test(value)
      ? value.startsWith("cms:") ? value.replace("cms:", "cms-preview:") : value
      : entry.source;
    const url = mediaUrl(safe);
    if (entry.element.tagName === "IMG") {
      entry.element.setAttribute("src", url);
    } else if (entry.originalStyle?.includes("background-image") || entry.originalStyle?.includes("backgroundImage")) {
      entry.element.style.backgroundImage = 'url("' + url + '")';
    }
  } else if (entry.field.kind === "link" && entry.element instanceof HTMLAnchorElement) {
    // A link is only shown as a visual target, never navigated in inspection mode.
    // Keep the actual href stable until the user saves and validates the draft.
  }
}

export function PagePreviewBridge({
  fields,
  values,
}: {
  fields: PageField[];
  values: PageValues;
}) {
  const [activeLabel, setActiveLabel] = useState("");
  const [status, setStatus] = useState("İçerik alanını seçmek için editördeki 'Sayfada göster' düğmesini kullanın.");

  useEffect(() => {
    const root = document.getElementById("main");
    if (!root) return;

    const targets = findFieldTargets(root, fields, values);
    let lastSelected = "";
    let lastFocusRequest = -1;
    let highlighted: HTMLElement | undefined;

    const pick = (key: string, scroll = true) => {
      if (highlighted) highlighted.classList.remove("cms-inspector-highlight");
      highlighted = undefined;
      const entry = targets.get(key);
      if (!entry) {
        setActiveLabel("");
        setStatus("Bu alan için sayfada otomatik bir konum bulunamadı. Diğer alanları kontrol edebilirsiniz.");
        window.parent.postMessage({ channel: CHANNEL, kind: "match", key, found: false }, window.location.origin);
        return;
      }
      highlighted = entry.element;
      highlighted.classList.add("cms-inspector-highlight");
      setActiveLabel(entry.field.label);
      setStatus("İşaretli alan, editörde seçtiğiniz alanın sayfadaki karşılığıdır.");
      if (scroll) {
        const rect = highlighted.getBoundingClientRect();
        window.scrollTo({
          top: Math.max(0, rect.top + window.scrollY - window.innerHeight / 2),
          behavior: "smooth",
        });
      }
      window.parent.postMessage({ channel: CHANNEL, kind: "match", key, found: true }, window.location.origin);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.channel !== CHANNEL || message.kind !== "sync") return;
      const incoming: unknown = message.values;
      if (incoming && typeof incoming === "object" && !Array.isArray(incoming)) {
        for (const [key, entry] of targets) {
          const value = (incoming as Record<string, unknown>)[key];
          if (typeof value === "string" && value.length <= 8000) applyPreview(entry, value);
        }
      }
      const selected = typeof message.selected === "string" ? message.selected : "";
      const focusRequest = Number.isSafeInteger(message.focusRequest) ? message.focusRequest : 0;
      if (selected && (selected !== lastSelected || focusRequest !== lastFocusRequest || !highlighted)) {
        lastSelected = selected;
        lastFocusRequest = focusRequest;
        pick(selected);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Prevent accidental navigation away from the protected preview.
      if (target.closest("a[href]")) event.preventDefault();
      let best: { key: string; element: HTMLElement } | undefined;
      for (const [key, entry] of targets) {
        if (!entry.element.contains(target)) continue;
        if (!best || best.element.contains(entry.element)) {
          best = { key, element: entry.element };
        }
      }
      if (best) {
        event.preventDefault();
        lastSelected = best.key;
        pick(best.key, false);
        window.parent.postMessage({
          channel: CHANNEL, kind: "edit", key: best.key,
        }, window.location.origin);
      }
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    window.parent.postMessage({ channel: CHANNEL, kind: "ready" }, window.location.origin);

    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      if (highlighted) highlighted.classList.remove("cms-inspector-highlight");
    };
  }, [fields, values]);

  return (
    <div className="cms-inspector-toolbar" role="status" aria-live="polite">
      <strong>◉ Görsel alan denetimi</strong>
      <span>{activeLabel ? activeLabel + " · " : ""}{status}</span>
      <small>Bu yalnızca yönetici önizlemesidir. Değişiklikler yayınlanmaz.</small>
    </div>
  );
}
