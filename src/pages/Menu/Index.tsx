import { NavLink } from 'react-router-dom';
import {
  DEFAULT_HOME_PATH,
  FREE_BOARD_PATH,
  LOGIN_PATH,
  MY_PAGE_PATH,
  PICS_PATH,
  PLAYGROUND_PATH,
  REGISTER_PATH,
  SETTINGS_PATH,
  SNAPS_PATH,
} from '@/constants/app';
import { useAuthStore } from '@/stores/authStore';

const Menu = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="container simple-page">
      <h2 className="simple-page__title">전체메뉴</h2>
      <nav className="menu-list" aria-label="전체메뉴">
        <NavLink to={DEFAULT_HOME_PATH} className="menu-list__item">
          홈
        </NavLink>
        <NavLink to={PLAYGROUND_PATH} className="menu-list__item">
          playground
        </NavLink>
        <NavLink to={FREE_BOARD_PATH} className="menu-list__item">
          자유게시판
        </NavLink>
        <NavLink to={SNAPS_PATH} className="menu-list__item">
          Snaps
        </NavLink>
        <NavLink to={PICS_PATH} className="menu-list__item">
          Pics
        </NavLink>
        <NavLink to="/about" className="menu-list__item">
          소개
        </NavLink>
        <NavLink to={isAuthenticated ? MY_PAGE_PATH : LOGIN_PATH} className="menu-list__item">
          {isAuthenticated ? '마이페이지' : '로그인'}
        </NavLink>
        {!isAuthenticated ? (
          <NavLink to={REGISTER_PATH} className="menu-list__item">
            회원가입
          </NavLink>
        ) : null}
        <NavLink to={SETTINGS_PATH} className="menu-list__item">
          설정
        </NavLink>
      </nav>
    </section>
  );
};

export default Menu;
