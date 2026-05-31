import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/hooks';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun size={16} />, label: '라이트' },
    { mode: 'dark', icon: <Moon size={16} />, label: '다크' },
    { mode: 'auto', icon: <Monitor size={16} />, label: '자동' },
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
