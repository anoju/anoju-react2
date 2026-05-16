import type React from 'react';
import { CheckCircle, Info, TriangleAlert, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  item: ToastItem;
}

const toastIcon = {
  info: <Info size={18} />,
  success: <CheckCircle size={18} />,
  warning: <TriangleAlert size={18} />,
  danger: <XCircle size={18} />,
} satisfies Record<ToastTone, React.ReactNode>;

export const Toast = ({ item }: ToastProps) => (
  <motion.div
    className="toast"
    data-tone={item.tone}
    role="status"
    initial={{ y: 12, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 12, opacity: 0 }}
  >
    <span className="toast__icon" aria-hidden="true">
      {toastIcon[item.tone]}
    </span>
    <p className="toast__message">{item.message}</p>
  </motion.div>
);
