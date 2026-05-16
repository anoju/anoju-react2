import { NavLink } from 'react-router-dom';
import { DEFAULT_HOME_PATH, MY_PAGE_PATH, SETTINGS_PATH } from '@/constants/app';

const Menu = () => (
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
      <NavLink to={MY_PAGE_PATH} className="menu-list__item">
        마이페이지
      </NavLink>
      <NavLink to={SETTINGS_PATH} className="menu-list__item">
        설정
      </NavLink>
    </nav>
  </section>
);

export default Menu;
