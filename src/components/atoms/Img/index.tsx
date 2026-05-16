import type React from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  darkSrc?: string;
  lightSrc?: string;
  alt: string;
}

export const Img = ({ src, darkSrc, lightSrc, alt, ...props }: ImgProps) => {
  const theme = useThemeStore((state) => state.theme);
  const resolvedSrc = theme === 'dark' ? darkSrc ?? src : lightSrc ?? src;

  return <img src={resolvedSrc} alt={alt} loading="lazy" {...props} />;
};
