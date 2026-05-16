import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode } from '@/types/common';

export type { ThemeMode };

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return { theme, setTheme };
};
