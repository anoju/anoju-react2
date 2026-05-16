import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ComponentSize, ComponentTone, ComponentVariant } from '@/types/common';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  variant?: ComponentVariant;
  tone?: ComponentTone;
  size?: ComponentSize;
}

const IconButton: React.FC<IconButtonProps> = ({
  label,
  icon,
  variant = 'ghost',
  tone = 'neutral',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const classNames = [
    'icon-button',
    `icon-button--${variant}`,
    `icon-button--${tone}`,
    `icon-button--${size}`,
    className,
  ].join(' ').trim();

  return (
    <motion.button
      className={classNames}
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {icon}
    </motion.button>
  );
};

export default IconButton;
