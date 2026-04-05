import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, type ThemeMode } from '../../../hooks/useTheme';
import './ThemeToggle.scss';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; icon: string; label: string }[] = [
    { mode: 'light', icon: '☀', label: '라이트' },
    { mode: 'dark', icon: '🌙', label: '다크' },
    { mode: 'auto', icon: 'A', label: '자동' },
  ];

  return (
    <div className="theme-toggle">
      {options.map((opt) => (
        <button
          key={opt.mode}
          className={`theme-toggle__btn ${theme === opt.mode ? 'theme-toggle__btn--active' : ''}`}
          onClick={() => setTheme(opt.mode)}
          aria-label={opt.label}
        >
          <span className="theme-toggle__icon">{opt.icon}</span>
          {theme === opt.mode && (
            <motion.div
              layoutId="active-theme-bg"
              className="theme-toggle__active-bg"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
