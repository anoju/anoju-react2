import type React from 'react';

interface PageProps {
  children: React.ReactNode;
}

export const Page = ({ children }: PageProps) => (
  <main className="page" id="main-content">
    {children}
  </main>
);
