import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import './Button.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full' : '',
    className
  ].join(' ').trim();

  return (
    <motion.button 
      className={classNames} 
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
