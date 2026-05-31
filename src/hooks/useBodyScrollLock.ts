import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/bodyScrollLock';

export const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const lockId = lockBodyScroll();

    return () => {
      unlockBodyScroll(lockId);
    };
  }, [active]);
};

