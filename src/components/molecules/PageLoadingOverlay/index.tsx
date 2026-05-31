import { AnimatePresence, motion } from 'framer-motion';
import { PageLoading } from '../PageLoading';
import { usePageLoadingStore } from '@/stores/pageLoadingStore';

export const PageLoadingOverlay = () => {
  const entries = usePageLoadingStore((state) => state.entries);
  const visible = entries.length > 0;
  const label = entries.at(-1)?.label;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="page-loading-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <PageLoading label={label} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

