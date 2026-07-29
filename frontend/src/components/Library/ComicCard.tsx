import { Link } from "react-router-dom";
import type { Comic } from "../../types";
import { api } from "../../lib/api";

export function ComicCard({ comic }: { comic: Comic }) {
  const progressPct =
    comic.progress && comic.pageCount > 0
      ? Math.round(((comic.progress.currentPage + 1) / comic.pageCount) * 100)
      : 0;

  if (comic.status === "processing") {
    return (
      <div className="flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded border border-dashed border-line bg-surface text-ink-faint">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-wider">Processing…</span>
      </div>
    );
  }

  if (comic.status === "error") {
    return (
      <div className="flex aspect-[2/3] flex-col items-center justify-center gap-1.5 rounded border border-marvel-dim bg-surface p-3 text-center text-marvel">
        <span className="font-mono text-[10px] uppercase tracking-wider">Import failed</span>
        <span className="text-[10px] text-ink-faint">{comic.errorMessage}</span>
      </div>
    );
  }

  return (
    <Link
      to={`/read/${comic.id}`}
      className="group relative block aspect-[2/3] overflow-hidden rounded border border-line bg-surface-2 transition-transform hover:-translate-y-0.5 hover:border-ink-faint"
    >
      {comic.coverKey ? (
        <img
          src={api.coverUrl(comic.id)}
          alt={comic.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-ink-faint">No cover</div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 pt-8">
        <div className="truncate text-xs font-semibold text-ink">{comic.title}</div>
        {comic.number && <div className="font-mono text-[10px] text-ink-dim">#{comic.number}</div>}
      </div>

      {progressPct > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/40">
          <div className="h-full bg-gold" style={{ width: `${progressPct}%` }} />
        </div>
      )}
    </Link>
  );
}
