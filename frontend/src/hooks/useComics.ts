import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const comicsKey = (params?: { search?: string; tag?: string }) => ["comics", params] as const;
const comicKey = (id: string) => ["comic", id] as const;

/**
 * Polls while any comic is still "processing" so the library grid picks up
 * the ready/error transition without the user refreshing. Once nothing is
 * processing, polling stops — no point hammering the API for a static list.
 */
export function useComics(params?: { search?: string; tag?: string }) {
  return useQuery({
    queryKey: comicsKey(params),
    queryFn: () => api.listComics(params),
    refetchInterval: (query) => {
      const stillProcessing = query.state.data?.some((c) => c.status === "processing");
      return stillProcessing ? 2000 : false;
    },
  });
}

export function useComic(id: string | undefined) {
  return useQuery({
    queryKey: comicKey(id ?? ""),
    queryFn: () => api.getComic(id!),
    enabled: !!id,
  });
}

export function useUploadComic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      api.uploadComic(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comics"] });
    },
  });
}

export function useDeleteComic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteComic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comics"] });
    },
  });
}

export function useUpdateProgress(comicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ currentPage, completed }: { currentPage: number; completed?: boolean }) =>
      api.updateProgress(comicId, currentPage, completed),
    // Optimistic: reading progress updates on every page turn, so waiting
    // for a round trip before the UI reflects it would feel laggy.
    onMutate: async ({ currentPage, completed }) => {
      await queryClient.cancelQueries({ queryKey: comicKey(comicId) });
      const previous = queryClient.getQueryData(comicKey(comicId));
      queryClient.setQueryData(comicKey(comicId), (old: any) =>
        old ? { ...old, progress: { ...old.progress, currentPage, completed: completed ?? old.progress?.completed } } : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(comicKey(comicId), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comics"] });
    },
  });
}

export function useTags() {
  return useQuery({ queryKey: ["tags"], queryFn: api.listTags });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ label, color }: { label: string; color: string }) => api.createTag(label, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useSetComicTags(comicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagIds: string[]) => api.setComicTags(comicId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comics"] });
      queryClient.invalidateQueries({ queryKey: comicKey(comicId) });
    },
  });
}
