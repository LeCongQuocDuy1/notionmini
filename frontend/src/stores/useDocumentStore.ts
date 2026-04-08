import { create } from 'zustand';

interface DocumentUIState {
  activeDocumentId: string | null;
  setActiveDocument: (id: string | null) => void;
}

export const useDocumentStore = create<DocumentUIState>((set) => ({
  activeDocumentId: null,
  setActiveDocument: (id) => set({ activeDocumentId: id }),
}));
