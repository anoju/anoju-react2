import type React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const BottomSheet = ({ open, title, children, onClose }: BottomSheetProps) => (
  <AnimatePresence>
    {open ? (
      <motion.div className="bottom-sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="bottom-sheet__overlay" type="button" aria-label="닫기" onClick={onClose} />
        <motion.div
          className="bottom-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'bottom-sheet-title' : undefined}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {title ? (
            <h2 className="bottom-sheet__title" id="bottom-sheet-title">
              {title}
            </h2>
          ) : null}
          <div className="bottom-sheet__body">{children}</div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
