"use client";

import { useEffect, useState } from "react";
import { mediaUrl, safeLocalHref } from "@/lib/urls";
import type { PageField, PageValues } from "@/lib/cms/page-values";
import {
  samePreviewUrl, styleHasMediaUrl, uniqueTextCandidate,
} from "@/lib/cms/preview-matching";

const CHANNEL = "istikbal:visual-editor:v1";
type PreviewEntry = {
  field: PageField;
  source: string;
  element: HTMLElement;
  textNode?: Text;
  originalText?: string;
  originalStyle?: string | null;
  originalSrc?: string | null;
};

function findFieldTargets(root: HTMLElement, fields: PageField[], values: PageValues) {
  const entries = new Map<string, PreviewEntry>();
  const markedElements = [...root.querySelectorAll<HTMLElement>("[data-cms-field]")];
  const reservedText = new Set<Text>();
  const reservedElements = new Set<HTMLElement>();

  // Duplicate sources are ambiguous without an explicit data-cms-field marker.
  // In particular, the same headline/image often appears on several cards.
  const sourceCounts = new Map<string, number>();
  for (const field of fields) {
    const source = values[field.key] ?? field.value;
    const identity = field.kind + "\0" + source;
    sourceCounts.set(identity, (sourceCounts.get(identity) ?? 0) + 1);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const parent = current.parentElement;
    if (parent && current.nodeValue?.trim() && !parent.closest("script,style,noscript")) {
      textNodes.push(current as Text);
    }
  }
  const imageElements = [...root.querySelectorAll<HTMLElement>("img,[style]")];
  const linkElements = [...root.querySelectorAll<HTMLAnchorElement>("a[href]")];

  for (const field of fields) {
    const source = values[field.key] ?? field.value;
    if (!source?.trim()) continue;
    const explicit = markedElements.filter((element) => element.dataset.cmsField === field.key);
    // A marker is authoritative only if that key occurs once in the page.
    if (explicit.length > 1) continue;
    const marker = explicit[0];
    const duplicated = (sourceCounts.get(field.kind + "\0" + source) ?? 0) > 1;

    if (field.kind === "text") {
      if (marker) {
        const contained = textNodes.filter((node) =>
          marker.contains(node) && !reservedText.has(node));
        const node = uniqueTextCandidate(contained, source, (candidate) => candidate.data)
          ?? (contained.length === 1 && contained[0].data.includes(source)
            ? contained[0] : null);
        if (node) reservedText.add(node);
        entries.set(field.key, {
          field, source, element: marker,
          textNode: node ?? undefined, originalText: node?.data,
        });
        continue;
      }
      if (duplicated) continue;
      // Never use substring matching for unmarked text: "ile" must never
      // attach to another paragraph containing that word.
      const available = textNodes.filter((node) =>
        !reservedText.has(node) &&
        !node.parentElement?.closest("[data-cms-field]"));
      const match = uniqueTextCandidate(available, source, (node) => node.data);
      if (match?.parentElement) {
        reservedText.add(match);
        entries.set(field.key, {
          field, source, element: match.parentElement,
          textNode: match, originalText: match.data,
        });
      }
      continue;
    }

    if (field.kind === "image") {
      const rendered = mediaUrl(
        source.startsWith("cms:") ? source.replace("cms:", "cms-preview:") : source,
      );
      const matches = marker ? [marker] : duplicated ? [] : imageElements.filter((element) => {
        if (reservedElements.has(element) || element.closest("[data-cms-field]")) return false;
        return samePreviewUrl(element.getAttribute("src"), rendered) ||
          styleHasMediaUrl(element.getAttribute("style"), rendered);
      });
      if (matches.length === 1) {
        const element = matches[0];
        reservedElements.add(element);
        entries.set(field.key, {
          field, source, element,
          originalSrc: element.getAttribute("src"),
          originalStyle: element.getAttribute("style"),
        });
      }
      continue;
    }

    if (field.kind === "link") {
      const targetUrl = /^https:\/\//.test(source) ? source : safeLocalHref(source);
      const matches = marker ? [marker] : duplicated ? [] : linkElements.filter((element) =>
        !reservedElements.has(element) &&
        !element.closest("[data-cms-field]") &&
        samePreviewUrl(element.getAttribute("href"), targetUrl));
      if (matches.length === 1) {
        const element = matches[0];
        reservedElements.add(element);
        entries.set(field.key, { field, source, element });
      }
    }
  }
  return entries;
}

function applyPreview(entry: PreviewEntry, value: string) {
  if (entry.field.kind === "text" && entry.textNode && entry.originalText !== undefined) {
    // Modify the original *text node* only; never inject markup.
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
    } else if (
      entry.originalStyle &&
      styleHasMediaUrl(entry.originalStyle, mediaUrl(
        entry.source.startsWith("cms:")
          ? entry.source.replace("cms:", "cms-preview:")
          : entry.source,
      ))
    ) {
      entry.element.style.backgroundImage = 'url("' + url + '")';
    }
  }
  // Links remain at their saved destinations until the form validates them.
}

export function PagePreviewBridge({
  fields,
  values,
}: {
  fields: PageField[];
  values: PageValues;
}) {
  const [activeLabel, setActiveLabel] = useState("");
  const [status, setStatus] = useState(
    "İçerik alanını seçmek için editördeki 'Sayfada göster' düğmesini kullanın.",
  );

  useEffect(() => {
    const root = document.getElementById("main");
    if (!root) return;

    const targets = findFieldTargets(root, fields, values);
    let lastSelected = "";
    let lastFocusRequest = -1;
    let highlighted: HTMLElement | undefined;

    const post = (message: Record<string, unknown>) => {
      window.parent.postMessage({ channel: CHANNEL, ...message }, window.location.origin);
    };

    const pick = (key: string, scroll = true) => {
      if (highlighted) highlighted.classList.remove("cms-inspector-highlight");
      highlighted = undefined;
      const entry = targets.get(key);
      if (!entry) {
        setActiveLabel("");
        setStatus(
          "Bu alanın sayfadaki konumu kesin belirlenemedi. Yanlış bölümü işaretlemek yerine alanı editörden düzenleyebilirsiniz.",
        );
        post({ kind: "match", key, found: false });
        return;
      }
      highlighted = entry.element;
      highlighted.classList.add("cms-inspector-highlight");
      setActiveLabel(entry.field.label);
      setStatus(entry.field.kind === "text" && !entry.textNode
        ? "Alan işaretlendi. Birden fazla metin düğümüne bölündüğü için canlı metin değişikliği gösterilemeyebilir."
        : "İşaretli alan editörde seçtiğiniz alanın sayfadaki karşılığıdır.");
      if (scroll) {
        const rect = highlighted.getBoundingClientRect();
        window.scrollTo({
          top: Math.max(0, rect.top + window.scrollY - window.innerHeight / 2),
          behavior: "smooth",
        });
      }
      post({ kind: "match", key, found: true });
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
      if (target.closest("a[href]")) event.preventDefault();

      // Pick the nearest known element, and refuse equally close ambiguous
      // targets. Nested cards can contain different editable descendants.
      const matches = [...targets].filter(([, entry]) => entry.element.contains(target));
      matches.sort((a, b) =>
        a[1].element.contains(b[1].element) ? 1 :
        b[1].element.contains(a[1].element) ? -1 : 0);
      const first = matches[0];
      if (!first || (matches[1] && matches[1][1].element === first[1].element)) return;
      event.preventDefault();
      lastSelected = first[0];
      pick(first[0], false);
      post({ kind: "edit", key: first[0] });
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    post({ kind: "ready", matched: targets.size, total: fields.length });

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
