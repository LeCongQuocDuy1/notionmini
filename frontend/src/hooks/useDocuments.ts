import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../lib/axios';
import type { Document, DocumentDetail } from '../types';

export const DOCUMENTS_KEY = ['documents'] as const;
export const ARCHIVED_KEY = ['documents', 'archived'] as const;
export const documentKey = (id: string) => ['documents', id] as const;

// ─── Queries ────────────────────────────────────────────────────────────────

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<Document[]>('/documents?isArchived=false');
      return data;
    },
  });
}

export function useArchivedDocuments() {
  return useQuery({
    queryKey: ARCHIVED_KEY,
    queryFn: async () => {
      const { data } = await api.get<Document[]>('/documents?isArchived=true');
      return data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: async () => {
      const { data } = await api.get<DocumentDetail>(`/documents/${id}`);
      return data;
    },
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (parentDocumentId?: string) => {
      const { data } = await api.post<Document>('/documents', {
        parentDocumentId: parentDocumentId ?? null,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
    onError: () => {
      toast.error('Không thể tạo trang mới');
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  type UpdatePayload = Partial<Pick<DocumentDetail, 'title' | 'content' | 'icon' | 'coverImage'>>;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePayload }) => {
      await api.patch(`/documents/${id}`, data);
      return { id, data };
    },

    onMutate: async ({ id, data }) => {
      // Cancel any in-flight refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: DOCUMENTS_KEY });
      await queryClient.cancelQueries({ queryKey: documentKey(id) });

      const prevList = queryClient.getQueryData<Document[]>(DOCUMENTS_KEY);
      const prevDetail = queryClient.getQueryData<DocumentDetail>(documentKey(id));

      // Optimistically update sidebar list (title, icon, coverImage)
      if (prevList) {
        queryClient.setQueryData<Document[]>(DOCUMENTS_KEY, (old) =>
          old?.map((doc) => (doc.id === id ? { ...doc, ...data } : doc)) ?? []
        );
      }
      // Optimistically update detail cache
      if (prevDetail) {
        queryClient.setQueryData<DocumentDetail>(documentKey(id), { ...prevDetail, ...data });
      }

      return { prevList, prevDetail };
    },

    onError: (_err, { id }, context) => {
      // Rollback
      if (context?.prevList) queryClient.setQueryData(DOCUMENTS_KEY, context.prevList);
      if (context?.prevDetail) queryClient.setQueryData(documentKey(id), context.prevDetail);
      toast.error('Không thể lưu thay đổi');
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: DOCUMENTS_KEY });
      const prevList = queryClient.getQueryData<Document[]>(DOCUMENTS_KEY);
      // Optimistically remove from sidebar immediately
      queryClient.setQueryData<Document[]>(DOCUMENTS_KEY, (old) =>
        old?.filter((doc) => doc.id !== id) ?? []
      );
      return { prevList };
    },

    onError: (_err, _id, context) => {
      if (context?.prevList) queryClient.setQueryData(DOCUMENTS_KEY, context.prevList);
      toast.error('Không thể xóa trang');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}

export function useRestoreDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/documents/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ARCHIVED_KEY });
    },
    onError: () => {
      toast.error('Không thể khôi phục trang');
    },
  });
}

export function useDeletePermanently() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}/permanent`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARCHIVED_KEY });
    },
    onError: () => {
      toast.error('Không thể xóa vĩnh viễn');
    },
  });
}
