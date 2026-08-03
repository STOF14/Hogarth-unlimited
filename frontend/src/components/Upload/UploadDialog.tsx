import { useRef, useState } from "react";
import { useUploadComic } from "../../hooks/useComics";
import { useUiStore } from "../../store/uiStore";

export function UploadDialog() {
  const { uploadDialogOpen, setUploadDialogOpen } = useUiStore();
  const upload = useUploadComic();
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!uploadDialogOpen) return null;

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    upload.reset();
    setProgress(0);
    upload.mutate(
      { file, onProgress: setProgress },
      {
        onSuccess: () => {
          setProgress(null);
          setUploadDialogOpen(false);
        },
        onError: () => {
          setProgress(null);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={() => !upload.isPending && setUploadDialogOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`w-full max-w-md rounded border bg-surface p-6 transition-colors ${
          dragOver ? "border-gold" : "border-line"
        }`}
      >
        <h2 className="font-display text-xl text-ink">Add a comic</h2>
        <p className="mt-1 text-xs text-ink-faint">.cbz / .cbr, up to 500MB</p>

        {upload.isPending ? (
          <div className="mt-6">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-gradient-to-r from-marvel to-dc transition-[width]"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] font-mono text-ink-dim">
              {progress !== null && progress < 100 ? `Uploading… ${progress}%` : "Extracting pages…"}
            </p>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex w-full flex-col items-center gap-2 rounded border border-dashed border-line py-8 text-ink-faint transition-colors hover:border-ink-dim hover:text-ink-dim"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="h-7 w-7 stroke-current">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" />
            </svg>
            <span className="text-xs">Drop file here, or click to browse</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          // No accept filter here on purpose: iOS Safari's file picker can't
// resolve a system file type for .cbr/.rar, so restricting to it
// makes iOS grey out valid files instead of just rejecting bad ones.
// The backend already validates the real extension server-side.
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {upload.isError && (
          <p className="mt-3 text-xs text-marvel">{(upload.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
