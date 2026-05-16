import { NavLink } from 'react-router-dom';
import { DEFAULT_HOME_PATH, LOGIN_PATH, MY_PAGE_PATH, REGISTER_PATH, SETTINGS_PATH } from '@/constants/app';
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
        <NavLink to="/gallery" className="menu-list__item">
          갤러리
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
