import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Spinner } from '../Spinner';
import type { ComponentSize, ComponentTone, ComponentVariant } from '@/types/common';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  tone?: ComponentTone;
  size?: ComponentSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'solid',
  tone = 'primary',
  size = 'md', 
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props 
}) => {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${tone}`,
    `button--${size}`,
    fullWidth ? 'button--full' : '',
    className
  ].join(' ').trim();

  return (
    <motion.button 
      className={classNames} 
      disabled={disabled || loading}
      data-loading={loading || undefined}
      whileHover={!disabled && !loading ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      <span className="button__label">{children}</span>
      {!loading ? rightIcon : null}
    </motion.button>
  );
};

export default Button;
