import { useComics } from "../../hooks/useComics";

export function StatsStrip() {
  const { data: comics } = useComics();

  if (!comics) return null;

  const total = comics.length;
  const inProgress = comics.filter((c) => c.progress && !c.progress.completed && c.progress.currentPage > 0).length;
  const completed = comics.filter((c) => c.progress?.completed).length;

  const stats = [
    { label: "Issues", value: total },
    { label: "Reading", value: inProgress },
    { label: "Completed", value: completed },
  ];

  return (
    <div className="relative z-10 flex gap-6 px-6 pb-4 pt-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
      {stats.map((s) => (
        <span key={s.label}>
          <span className="text-gold">{s.value}</span> {s.label}
        </span>
      ))}
    </div>
  );
}
