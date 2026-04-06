import { create } from 'zustand';
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
  setActiveDocument: (id: string | null) => void;

  // Lấy document con trực tiếp của một node (dùng trong Recursive Sidebar)
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
    }
  },

  createDocument: async (parentDocumentId) => {
    const { data } = await api.post<Document>('/documents', {
      parentDocumentId: parentDocumentId ?? null,
    });
    // Thêm document mới vào store ngay lập tức (optimistic)
    set((state) => ({ documents: [...state.documents, data] }));
    return data;
  },

  updateDocument: async (id, data) => {
    await api.patch(`/documents/${id}`, data);
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...data } : doc
      ),
    }));
  },

  archiveDocument: async (id) => {
    await api.delete(`/documents/${id}`);
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      activeDocumentId: state.activeDocumentId === id ? null : state.activeDocumentId,
    }));
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  getChildren: (parentId) => {
    return get().documents.filter((doc) => doc.parentDocumentId === parentId);
  },
}));
