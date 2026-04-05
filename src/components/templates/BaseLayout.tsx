import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from '../atoms';
import '@/assets/styles/layout/BaseLayout.scss';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
}

const BaseLayout: React.FC<LayoutProps> = ({ title, children }) => {
  const pageTitle = title ? `${title} | Anoju` : 'Anoju';

  return (
    <div className="layout">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="header__logo">Anoju</Link>
          <nav className="header__nav">
            <ul className="header__menu">
              <li><NavLink to="/" className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}>홈</NavLink></li>
              <li><NavLink to="/gallery" className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}>갤러리</NavLink></li>
              <li><NavLink to="/about" className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}>소개</NavLink></li>
            </ul>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p className="footer__copy">&copy; 2026 Anoju. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;
