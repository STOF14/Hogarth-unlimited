import { useRef, useState } from "react";
import { api } from "../../lib/api";
import { usePagePrefetch } from "../../hooks/usePagePrefetch";

interface PagedViewProps {
  comicId: string;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ZOOM_LEVEL = 2.4;
const SWIPE_THRESHOLD_PX = 60;

export function PagedView({ comicId, pageCount, currentPage, onPageChange }: PagedViewProps) {
  usePagePrefetch(comicId, currentPage, pageCount);

  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const swipeStartX = useRef<number | null>(null);

  const goTo = (page: number) => {
    if (page < 0 || page >= pageCount) return;
    setZoomed(false);
    setPan({ x: 0, y: 0 });
    onPageChange(page);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomed) {
      dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    } else {
      swipeStartX.current = e.clientX;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (zoomed && dragState.current) {
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragState.current = null;
    if (!zoomed && swipeStartX.current !== null) {
      const dx = e.clientX - swipeStartX.current;
      if (dx > SWIPE_THRESHOLD_PX) goTo(currentPage - 1);
      else if (dx < -SWIPE_THRESHOLD_PX) goTo(currentPage + 1);
      swipeStartX.current = null;
    }
  };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => {
        setZoomed((z) => !z);
        setPan({ x: 0, y: 0 });
      }}
    >
      <img
        src={api.pageUrl(comicId, currentPage)}
        alt={`Page ${currentPage + 1}`}
        draggable={false}
        className="max-h-full max-w-full object-contain transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? ZOOM_LEVEL : 1})`,
          cursor: zoomed ? "grab" : "default",
        }}
      />

      {/* Invisible tap zones for prev/next — sit under the image, ignored while zoomed. */}
      {!zoomed && (
        <>
          <button
            aria-label="Previous page"
            onClick={() => goTo(currentPage - 1)}
            className="absolute left-0 top-0 h-full w-1/4"
          />
          <button
            aria-label="Next page"
            onClick={() => goTo(currentPage + 1)}
            className="absolute right-0 top-0 h-full w-1/4"
          />
        </>
      )}
    </div>
  );
}
