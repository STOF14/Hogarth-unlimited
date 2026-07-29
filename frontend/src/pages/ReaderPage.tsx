import { useParams } from "react-router-dom";
import { useComic } from "../hooks/useComics";
import { Reader } from "../components/Reader/Reader";

export function ReaderPage() {
  const { comicId } = useParams<{ comicId: string }>();
  const { data: comic, isLoading, isError } = useComic(comicId);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-ink-faint">Loading…</div>;
  }
  if (isError || !comic) {
    return <div className="flex h-full items-center justify-center text-marvel">Comic not found.</div>;
  }
  return <Reader comic={comic} />;
}
