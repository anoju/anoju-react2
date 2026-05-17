import type React from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import Button from '@/components/atoms/Button';

interface FixedBottomActionsProps {
  children: React.ReactNode;
  className?: string;
}

const enforceLargeButton = (child: React.ReactNode) => {
  if (isValidElement<{ size?: 'lg' }>(child) && child.type === Button) {
    return cloneElement(child, { size: 'lg' });
  }

  return child;
};

export const FixedBottomActions = ({ children, className }: FixedBottomActionsProps) => (
  <div className={`fixed-bottom-actions${className ? ` ${className}` : ''}`}>
    {Children.map(children, enforceLargeButton)}
  </div>
);
