import { useTags } from "../../hooks/useComics";
import { useUiStore } from "../../store/uiStore";

export function FilterChips() {
  const { data: tags } = useTags();
  const { activeTagId, setActiveTagId } = useUiStore();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="relative z-10 flex flex-wrap gap-2 px-6 pb-3 pt-3">
      <button
        onClick={() => setActiveTagId(null)}
        className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition-colors ${
          activeTagId === null
            ? "border-ink bg-ink text-void"
            : "border-line text-ink-dim hover:border-ink-faint"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => setActiveTagId(tag.id === activeTagId ? null : tag.id)}
          className="rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition-colors"
          style={
            activeTagId === tag.id
              ? { borderColor: tag.color, backgroundColor: tag.color, color: "#0A0A0D" }
              : { borderColor: "#2C2C36", color: "#9A99A6" }
          }
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
