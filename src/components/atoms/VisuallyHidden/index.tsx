import type React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
}

export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => (
  <span className="sr-only">{children}</span>
);
