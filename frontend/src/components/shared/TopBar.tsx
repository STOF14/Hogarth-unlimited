import { useUiStore } from "../../store/uiStore";

export function TopBar() {
  const { search, setSearch, setUploadDialogOpen } = useUiStore();

  return (
    <div className="relative z-10 flex items-center gap-4 border-b border-line px-6 pb-3.5 pt-4.5">
      <div className="flex items-baseline gap-0.5">
        <span className="font-display text-3xl text-marvel">HOG</span>
        <span className="font-display text-3xl text-dc">ARTH</span>
        <span className="font-display text-3xl text-ink">.</span>
        <span className="ml-1.5 pt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
          unlimited
        </span>
      </div>

      <div className="relative ml-auto max-w-[420px] flex-1">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 stroke-ink-faint"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or series…"
          className="w-full rounded border border-line bg-surface py-2.5 pl-8 pr-3 text-sm text-ink outline-none transition-colors focus:border-ink-faint"
        />
      </div>

      <button
        onClick={() => setUploadDialogOpen(true)}
        className="inline-flex items-center gap-1.5 rounded border-none bg-gradient-to-r from-marvel to-dc px-3.5 py-2.5 text-xs font-semibold tracking-wide text-white transition-[filter] hover:brightness-110 active:scale-[.97]"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add comic
      </button>
    </div>
  );
}
