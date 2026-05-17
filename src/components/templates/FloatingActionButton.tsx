import type React from 'react';
import { Link } from 'react-router-dom';
import { VisuallyHidden } from '@/components/atoms';

interface FloatingActionButtonProps {
  label: string;
  icon: React.ReactNode;
  to?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

export const FloatingActionButton = ({ label, icon, to, type = 'button', onClick }: FloatingActionButtonProps) => {
  const content = (
    <>
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </>
  );

  if (to) {
    return (
      <Link className="floating-action-btn" to={to} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className="floating-action-btn" aria-label={label} onClick={onClick}>
      {content}
    </button>
  );
};

