import type { ReactNode } from 'react';

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
}

export const GlassSurface = ({ children, className }: GlassSurfaceProps) => {
  const classNames = ['glass-surface', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <svg className="glass-surface__filter" aria-hidden="true" focusable="false">
        <filter id="anoju-glass-surface-filter" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="8" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.8" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="glass-surface__content">{children}</div>
    </div>
  );
};
