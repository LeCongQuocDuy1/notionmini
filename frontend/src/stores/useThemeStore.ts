import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    { name: 'theme-storage' }
  )
);

// Apply saved theme on module load
const saved = localStorage.getItem('theme-storage');
if (saved) {
  try {
    const { state } = JSON.parse(saved);
    if (state?.isDark !== false) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    document.documentElement.classList.add('dark');
  }
} else {
  document.documentElement.classList.add('dark');
}
