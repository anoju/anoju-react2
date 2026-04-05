import React from 'react';
import './ThemeToggle.scss';
import { useTheme, type ThemeMode } from '../../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = (mode: ThemeMode) => {
    setTheme(mode);
  };

  return (
    <div className="theme-toggle">
      <button 
        className={`theme-toggle__btn ${theme === 'light' ? 'theme-toggle__btn--active' : ''}`}
        onClick={() => handleToggle('light')}
        aria-label="라이트 모드"
      >
        ☀
      </button>
      <button 
        className={`theme-toggle__btn ${theme === 'dark' ? 'theme-toggle__btn--active' : ''}`}
        onClick={() => handleToggle('dark')}
        aria-label="다크 모드"
      >
        🌙
      </button>
      <button 
        className={`theme-toggle__btn ${theme === 'auto' ? 'theme-toggle__btn--active' : ''}`}
        onClick={() => handleToggle('auto')}
        aria-label="시스템 설정"
      >
        A
      </button>
    </div>
  );
};

export default ThemeToggle;
