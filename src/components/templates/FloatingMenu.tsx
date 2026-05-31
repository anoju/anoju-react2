import { Gamepad2, Images, LogIn, Menu, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  LOGIN_PATH,
  MENU_PATH,
  MY_PAGE_PATH,
  LOUNGE_PATH,
  SNAPS_PATH,
} from "@/constants/app";
import { useAuthStore } from "@/stores/authStore";
import { GlassSurface } from "@/components/molecules";
import type { FloatingMenuConfig } from "@/routes/types";

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
  const myPageLabel = isAuthenticated ? "Mypage" : "Login";
  const MyPageIcon = isAuthenticated ? UserRound : LogIn;

  return (
    <motion.nav
      className="floating-menu"
      aria-label="주요 메뉴"
      initial={false}
      animate={{
        y: visible ? 0 : "calc(100% + 24px)",
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <GlassSurface className="floating-menu__surface">
        <NavLink to={MENU_PATH} className="floating-menu__item">
          <Menu size={20} />
          <span>Menu</span>
        </NavLink>
        <NavLink to={LOUNGE_PATH} className="floating-menu__item">
          <Gamepad2 size={20} />
          <span>Lounge</span>
        </NavLink>
        <NavLink to={SNAPS_PATH} className="floating-menu__item">
          <Images size={20} />
          <span>Snaps</span>
        </NavLink>
        <NavLink to={myPageTarget} className="floating-menu__item">
          <MyPageIcon size={20} />
          <span>{myPageLabel}</span>
        </NavLink>
      </GlassSurface>
    </motion.nav>
  );
};
