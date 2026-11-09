import { chapters } from "@/data/navigation";
export function ChapterNavigation() {
  return (
    <nav className="chapter-nav" aria-label="Ana sayfa bölüm navigasyonu">
      <button
        type="button"
        className="chapter-nav-toggle"
        aria-expanded="false"
        aria-controls="chapter-nav-list"
      >
        Bölümler <span aria-hidden="true">▦</span>
      </button>
      <ol id="chapter-nav-list">
        {chapters.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              className={`chapter-step${index === 0 ? " is-active" : ""}`}
              data-chapter-index={index}
              aria-label={`${label} bölümüne git`}
              aria-current={index === 0 ? "location" : undefined}
            >
              <span className="chapter-label" aria-hidden="true">
                {label}
              </span>
              <span className="chapter-dot" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
