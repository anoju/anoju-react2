import { motion } from 'framer-motion';
import anojuLogo from '@/assets/images/common/logo.svg';
import { Img } from '@/components/atoms';

interface PageLoadingProps {
  label?: string;
}

export const PageLoading = ({ label = '화면을 불러오고 있습니다.' }: PageLoadingProps) => (
  <div className="page-loading" role="status" aria-live="polite">
    <motion.div
      className="page-loading__mark"
      animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="page-loading__orbit" aria-hidden="true" />
      <motion.span
        className="page-loading__glow"
        aria-hidden="true"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Img className="page-loading__logo" src={anojuLogo} alt="" />
    </motion.div>
    <p className="page-loading__text">{label}</p>
  </div>
);
