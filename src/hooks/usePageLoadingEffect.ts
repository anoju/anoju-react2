import { useEffect } from 'react';
import { closePageLoading, openPageLoading } from '@/stores/pageLoadingStore';

export const usePageLoadingEffect = (active: boolean, label?: string) => {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const loadingId = openPageLoading(label);

    return () => {
      closePageLoading(loadingId);
    };
  }, [active, label]);
};

