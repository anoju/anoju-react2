import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/app';
import type { FontMode, ThemeMode } from '@/types/common';

interface ThemeState {
  theme: ThemeMode;
  fontMode: FontMode;
  setTheme: (theme: ThemeMode) => void;
  setFontMode: (fontMode: FontMode) => void;
}

const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
};

const applyFontMode = (fontMode: FontMode) => {
  const root = document.documentElement;
  root.dataset.fontMode = fontMode;
  window.dispatchEvent(new CustomEvent('anoju:font-mode-change', { detail: { fontMode } }));
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'auto',
      fontMode: 'base',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setFontMode: (fontMode) => {
        applyFontMode(fontMode);
        set({ fontMode });
      },
    }),
    {
      name: STORAGE_KEYS.theme,
      partialize: ({ theme, fontMode }) => ({ theme, fontMode }),
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? 'auto');
        applyFontMode(state?.fontMode ?? 'base');
      },
    },
  ),
);

export const initializeThemeAttributes = () => {
  const { theme, fontMode } = useThemeStore.getState();
  applyTheme(theme);
  applyFontMode(fontMode);
};
