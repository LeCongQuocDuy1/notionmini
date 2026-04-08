import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarPosition: 'left' | 'right';
  toggleSidebarPosition: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebarPosition: 'left',
      toggleSidebarPosition: () =>
        set({ sidebarPosition: get().sidebarPosition === 'left' ? 'right' : 'left' }),
    }),
    { name: 'notion-mini-layout' }
  )
);
