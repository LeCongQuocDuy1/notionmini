import { create } from 'zustand';
import type { Document } from '../types';
import api from '../lib/axios';

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  isLoading: boolean;

  fetchDocuments: () => Promise<void>;
  createDocument: (parentDocumentId?: string) => Promise<Document>;
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

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  getChildren: (parentId) => {
    return get().documents.filter((doc) => doc.parentDocumentId === parentId);
  },
}));
