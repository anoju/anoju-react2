import { useEffect } from 'react';
import { useLocalStorageState } from 'ahooks';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorageState<ThemeMode>('anoju-theme', {
    defaultValue: 'auto',
  });

  useEffect(() => {
    // 이전 'theme' 키(JSON이 아닌 원시 문자열)가 남아있어 발생하는 구문 에러 방지용 정리
    if (localStorage.getItem('theme') && !localStorage.getItem('theme')?.includes('"')) {
      localStorage.removeItem('theme');
    }

    const root = document.documentElement;
    
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme as string);
    }
  }, [theme]);

  return { theme, setTheme };
};
