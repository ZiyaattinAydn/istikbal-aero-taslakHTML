"use client";
import { useEffect, useRef, useState } from "react";
export function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="language-picker" ref={ref}>
      <button
        type="button"
        id="language-trigger"
        className="lang"
        aria-controls="language-menu"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Dil seçimi: Türkçe"
        onClick={() => setOpen(!open)}
      >
        TR{" "}
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path
            d="m5 7 5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      </button>
      <div id="language-menu" className="language-menu" hidden={!open}>
        <span className="language-current" aria-current="true">
          TR · Türkçe
        </span>
        <button
          type="button"
          className="language-unavailable"
          disabled
          title="İngilizce çeviri henüz hazır değil"
        >
          EN · English <small>Yakında</small>
        </button>
      </div>
    </div>
  );
}
