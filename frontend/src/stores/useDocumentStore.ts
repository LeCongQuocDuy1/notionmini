import { create } from 'zustand';
import { toast } from 'sonner';
import type { Document, DocumentDetail } from '../types';
import api from '../lib/axios';

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  isLoading: boolean;

  fetchDocuments: () => Promise<void>;
  createDocument: (parentDocumentId?: string) => Promise<Document>;
  updateDocument: (id: string, data: Partial<Pick<DocumentDetail, 'title' | 'content' | 'icon' | 'coverImage'>>) => Promise<void>;
  archiveDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  deleteDocumentPermanently: (id: string) => Promise<void>;
  setActiveDocument: (id: string | null) => void;

  getChildren: (parentId: string | null) => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  isLoading: false,

  fetchDocuments: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<Document[]>('/documents?isArchived=false');
      set({ documents: data, isLoading: false });
    } catch {
      set({ isLoading: false });
      toast.error('Không thể tải danh sách trang');
    }
  },

  createDocument: async (parentDocumentId) => {
    const { data } = await api.post<Document>('/documents', {
      parentDocumentId: parentDocumentId ?? null,
    });
    set((state) => ({ documents: [...state.documents, data] }));
    return data;
  },

  updateDocument: async (id, data) => {
    try {
      await api.patch(`/documents/${id}`, data);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...data } : doc
        ),
      }));
    } catch {
      toast.error('Không thể lưu thay đổi');
    }
  },

  archiveDocument: async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
      }));
    } catch {
      toast.error('Không thể xóa trang');
    }
  },

  restoreDocument: async (id) => {
    try {
      await api.patch(`/documents/${id}/restore`);
      await get().fetchDocuments();
    } catch {
      toast.error('Không thể khôi phục trang');
    }
  },

  deleteDocumentPermanently: async (id) => {
    try {
      await api.delete(`/documents/${id}/permanent`);
    } catch {
      toast.error('Không thể xóa vĩnh viễn');
    }
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  getChildren: (parentId) => {
    return get().documents.filter((doc) => doc.parentDocumentId === parentId);
  },
}));
