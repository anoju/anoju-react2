import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    return savedTheme || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 시스템 설정 변경 감지 (auto 모드일 때 실시간 반영은 CSS 미디어 쿼리가 처리함)
  
  return { theme, setTheme };
};
