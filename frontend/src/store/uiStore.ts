import { create } from "zustand";

export type UniverseFilter = "all" | "marvel" | "dc" | "both";
export type ReaderMode = "paged" | "scroll";

interface UiState {
  search: string;
  setSearch: (value: string) => void;

  universeFilter: UniverseFilter;
  setUniverseFilter: (value: UniverseFilter) => void;

  activeTagId: string | null;
  setActiveTagId: (id: string | null) => void;

  readerMode: ReaderMode;
  setReaderMode: (mode: ReaderMode) => void;

  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
}

/**
 * Local/ephemeral UI state only. Anything that comes from — or needs to be
 * persisted to — the server (comics, tags, progress) lives in TanStack
 * Query instead; see hooks/useComics.ts. Keeping that split is what makes
 * this maintainable: this store never fetches, and Query never holds
 * transient view state.
 */
export const useUiStore = create<UiState>((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),

  universeFilter: "all",
  setUniverseFilter: (value) => set({ universeFilter: value }),

  activeTagId: null,
  setActiveTagId: (id) => set({ activeTagId: id }),

  readerMode: "paged",
  setReaderMode: (mode) => set({ readerMode: mode }),

  uploadDialogOpen: false,
  setUploadDialogOpen: (open) => set({ uploadDialogOpen: open }),
}));
