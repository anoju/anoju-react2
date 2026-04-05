import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ThemeToggle } from '../atoms';
import './BaseLayout.scss';

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
          <h1 className="header__logo">Anoju</h1>
          <nav className="header__nav">
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
