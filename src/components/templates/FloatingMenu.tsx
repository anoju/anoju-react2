import { Home, Menu, UserRound, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { DEFAULT_HOME_PATH, LOGIN_PATH, MENU_PATH, MY_PAGE_PATH } from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';
import type { FloatingMenuConfig } from '@/routes/types';

interface FloatingMenuProps {
  config: FloatingMenuConfig;
  visible: boolean;
}

export const FloatingMenu = ({ config, visible }: FloatingMenuProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!config.enabled) {
    return null;
  }

  const myPageTarget = isAuthenticated ? MY_PAGE_PATH : LOGIN_PATH;
  const myPageLabel = isAuthenticated ? '마이페이지' : '로그인';
  const MyPageIcon = isAuthenticated ? UserRound : LogIn;

  return (
    <motion.nav
      className="floating-menu"
      aria-label="주요 메뉴"
      initial={false}
      animate={{ y: visible ? 0 : 'calc(100% + 24px)', opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <NavLink to={DEFAULT_HOME_PATH} className="floating-menu__item">
        <Home size={20} />
        <span>홈</span>
      </NavLink>
      <NavLink to={MENU_PATH} className="floating-menu__item">
        <Menu size={20} />
        <span>전체메뉴</span>
      </NavLink>
      <NavLink to={myPageTarget} className="floating-menu__item">
        <MyPageIcon size={20} />
        <span>{myPageLabel}</span>
      </NavLink>
    </motion.nav>
  );
};
