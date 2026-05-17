import type React from 'react';

interface FloatingActionsProps {
  label: string;
  children: React.ReactNode;
  aboveFixedActions?: boolean;
}

export const FloatingActions = ({ label, children, aboveFixedActions = false }: FloatingActionsProps) => (
  <div className={`floating-actions${aboveFixedActions ? ' floating-actions--above-fixed' : ''}`} aria-label={label}>
    {children}
  </div>
);

