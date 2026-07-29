import { useEffect, useRef } from "react";
import { api } from "../../lib/api";

interface ScrollViewProps {
  comicId: string;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Continuous vertical scroll, like a webtoon reader. Uses an
 * IntersectionObserver rather than scroll-position math to figure out
 * which page is "current" — cheaper and doesn't drift on resize/zoom.
 */
export function ScrollView({ comicId, pageCount, currentPage, onPageChange }: ScrollViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledToInitial = useRef(false);

  useEffect(() => {
    if (hasScrolledToInitial.current) return;
    const target = pageRefs.current[currentPage];
    if (target) {
      target.scrollIntoView({ block: "start" });
      hasScrolledToInitial.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset.pageIndex);
          if (!Number.isNaN(index)) onPageChange(index);
        }
      },
      { root, threshold: [0.5] }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto">
      {Array.from({ length: pageCount }).map((_, index) => (
        <div
          key={index}
          data-page-index={index}
          ref={(el) => (pageRefs.current[index] = el)}
          className="flex justify-center py-1"
        >
          <img
            src={api.pageUrl(comicId, index)}
            alt={`Page ${index + 1}`}
            loading="lazy"
            className="max-w-full"
          />
        </div>
      ))}
    </div>
  );
}
