export type ComicStatus = "processing" | "ready" | "error";
export type ComicFormat = "cbz" | "cbr";

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface ReadingProgress {
  comicId: string;
  currentPage: number;
  completed: boolean;
  updatedAt: string;
}

export interface Comic {
  id: string;
  title: string;
  series: string | null;
  number: string | null;
  writer: string | null;
  penciller: string | null;
  year: string | null;
  summary: string | null;
  fileName: string;
  format: ComicFormat;
  status: ComicStatus;
  errorMessage: string | null;
  pageCount: number;
  coverKey: string | null;
  createdAt: string;
  updatedAt: string;
  tags: { tag: Tag }[];
  progress: ReadingProgress | null;
}

export interface Page {
  id: string;
  comicId: string;
  index: number;
  imageKey: string;
  width: number | null;
  height: number | null;
}

export interface ComicDetail extends Comic {
  pages: Page[];
}
