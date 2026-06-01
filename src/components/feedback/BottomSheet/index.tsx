import type React from 'react';
import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBodyScrollLock } from '@/hooks';
import { useOverlayStore } from '@/stores/overlayStore';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  closeLabel?: string;
  closeOnBack?: boolean;
}

export const BottomSheet = ({
  open,
  title,
  children,
  onClose,
  showCloseButton = true,
  closeLabel = '닫기',
  closeOnBack = true,
}: BottomSheetProps) => {
  const overlayId = useId();
  const titleId = `${overlayId}-title`;
  const registerOverlay = useOverlayStore((state) => state.registerOverlay);
  const unregisterOverlay = useOverlayStore((state) => state.unregisterOverlay);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    registerOverlay({
      id: overlayId,
      type: 'bottomSheet',
      close: onClose,
      closeOnBack,
    });

    return () => {
      unregisterOverlay(overlayId);
    };
  }, [closeOnBack, onClose, open, overlayId, registerOverlay, unregisterOverlay]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="bottom-sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="bottom-sheet__overlay" type="button" aria-label={closeLabel} onClick={onClose} />
          <motion.div
            className="bottom-sheet__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <header className="bottom-sheet__header">
              {title ? (
                <h2 className="bottom-sheet__title" id={titleId}>
                  {title}
                </h2>
              ) : null}
              {showCloseButton ? (
                <button className="bottom-sheet__close" type="button" aria-label={closeLabel} title={closeLabel} onClick={onClose}>
                  <X size={18} aria-hidden="true" />
                </button>
              ) : null}
            </header>
            <div className="bottom-sheet__body">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
