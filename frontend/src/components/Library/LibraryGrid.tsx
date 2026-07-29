import { useComics } from "../../hooks/useComics";
import { useDebounced } from "../../hooks/useDebounced";
import { useUiStore } from "../../store/uiStore";
import { ComicCard } from "./ComicCard";

export function LibraryGrid() {
  const { search, activeTagId } = useUiStore();
  const debouncedSearch = useDebounced(search, 250);

  const { data: comics, isLoading, isError } = useComics({
    search: debouncedSearch || undefined,
    tag: activeTagId ?? undefined,
  });

  if (isLoading) {
    return <div className="px-6 py-16 text-center text-sm text-ink-faint">Loading library…</div>;
  }

  if (isError) {
    return (
      <div className="px-6 py-16 text-center text-sm text-marvel">
        Couldn't reach the API. Check VITE_API_BASE_URL and that the backend is running.
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-24 text-center text-ink-faint">
        <span className="font-display text-2xl text-ink-dim">Empty shelf</span>
        <span className="text-sm">Add a .cbz or .cbr to get started.</span>
      </div>
    );
  }

  return (
    <div className="relative z-10 grid grid-cols-2 gap-3 overflow-y-auto px-6 pb-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
