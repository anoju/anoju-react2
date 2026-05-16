import { useEffect, useRef, useState } from 'react';

type ScrollDirection = 'up' | 'down';

export const useScrollDirection = (threshold = 8) => {
  const [direction, setDirection] = useState<ScrollDirection>('up');
  const [isNearTop, setIsNearTop] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastYRef.current;

      setIsNearTop(currentY < 16);

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? 'down' : 'up');
        lastYRef.current = currentY;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { direction, isNearTop };
};
