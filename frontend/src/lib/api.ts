import type { Comic, ComicDetail, Tag } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const TOKEN = import.meta.env.VITE_API_TOKEN as string;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listComics: (params?: { search?: string; tag?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.tag) qs.set("tag", params.tag);
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<Comic[]>(`/api/comics${suffix}`);
  },

  getComic: (id: string) => request<ComicDetail>(`/api/comics/${id}`),

  uploadComic: async (file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);

    return new Promise<Comic>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/api/comics`);
      xhr.setRequestHeader("Authorization", `Bearer ${TOKEN}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new ApiError(xhr.status, xhr.responseText));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },

  deleteComic: (id: string) => request<void>(`/api/comics/${id}`, { method: "DELETE" }),

  updateProgress: (id: string, currentPage: number, completed?: boolean) =>
    request(`/api/comics/${id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPage, completed }),
    }),

  listTags: () => request<Tag[]>("/api/tags"),

  createTag: (label: string, color: string) =>
    request<Tag>("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, color }),
    }),

  setComicTags: (comicId: string, tagIds: string[]) =>
    request<Comic>(`/api/comics/${comicId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    }),

  pageUrl: (comicId: string, index: number) =>
    `${BASE_URL}/api/comics/${comicId}/pages/${index}?token=${encodeURIComponent(TOKEN)}`,
  coverUrl: (comicId: string) => `${BASE_URL}/api/comics/${comicId}/cover?token=${encodeURIComponent(TOKEN)}`,
};

export { ApiError };
