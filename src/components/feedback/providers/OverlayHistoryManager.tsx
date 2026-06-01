import { useEffect, useRef } from 'react';
import { useOverlayStore } from '@/stores/overlayStore';

const OVERLAY_HISTORY_KEY = '__anojuOverlay';

const getOverlayHistoryState = () => ({
  ...(window.history.state ?? {}),
  [OVERLAY_HISTORY_KEY]: true,
});

export const OverlayHistoryManager = () => {
  const stack = useOverlayStore((state) => state.stack);
  const closeTopOverlay = useOverlayStore((state) => state.closeTopOverlay);
  const hasHistoryEntryRef = useRef(false);
  const isConsumingHistoryRef = useRef(false);

  useEffect(() => {
    if (stack.length > 0 && !hasHistoryEntryRef.current) {
      window.history.pushState(getOverlayHistoryState(), '', window.location.href);
      hasHistoryEntryRef.current = true;
      return;
    }

    if (stack.length === 0 && hasHistoryEntryRef.current && !isConsumingHistoryRef.current) {
      isConsumingHistoryRef.current = true;
      window.history.back();
    }
  }, [stack.length]);

  useEffect(() => {
    const handlePopState = () => {
      if (!hasHistoryEntryRef.current) {
        return;
      }

      if (isConsumingHistoryRef.current) {
        hasHistoryEntryRef.current = false;
        isConsumingHistoryRef.current = false;
        return;
      }

      const hasClosedOverlay = closeTopOverlay();

      if (!hasClosedOverlay) {
        window.history.pushState(getOverlayHistoryState(), '', window.location.href);
        hasHistoryEntryRef.current = true;
        isConsumingHistoryRef.current = false;
        return;
      }

      hasHistoryEntryRef.current = false;
      isConsumingHistoryRef.current = false;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [closeTopOverlay]);

  return null;
};
