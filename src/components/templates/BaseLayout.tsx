import React from 'react';
import { Helmet } from 'react-helmet-async';
import './BaseLayout.scss';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
}

const BaseLayout: React.FC<LayoutProps> = ({ title, children }) => {
  const pageTitle = title ? `${title} | anoju-react2` : 'anoju-react2';

  return (
    <div className="layout">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      
      <header className="header">
        <div className="container header__inner">
          <h1 className="header__logo">anoju</h1>
          <nav className="header__nav">
            {/* Navigation items will be added later */}
          </nav>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p className="footer__copy">&copy; 2026 anoju. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;
