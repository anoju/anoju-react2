import type { ComponentSize } from '@/types/common';

interface SpinnerProps {
  size?: Extract<ComponentSize, 'xs' | 'sm' | 'md' | 'lg'>;
  label?: string;
}

export const Spinner = ({ size = 'md', label = '로딩 중' }: SpinnerProps) => (
  <span className={`spinner spinner--${size}`} role="status" aria-label={label} />
);
