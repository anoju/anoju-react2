import type React from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Alert } from '../Alert';
import { Confirm } from '../Confirm';
import { Toast, type ToastItem } from '../Toast';
import {
  FEEDBACK_EVENTS,
  feedbackTarget,
  type AlertRequest,
  type ConfirmRequest,
  type ToastRequest,
} from '../services/feedbackEvents';

interface FeedbackProviderProps {
  children: React.ReactNode;
}

export const FeedbackProvider = ({ children }: FeedbackProviderProps) => {
  const [alertRequest, setAlertRequest] = useState<AlertRequest | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleAlert = (event: Event) => {
      setAlertRequest((event as CustomEvent<AlertRequest>).detail);
    };

    const handleConfirm = (event: Event) => {
      setConfirmRequest((event as CustomEvent<ConfirmRequest>).detail);
    };

    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastRequest>).detail;
      const id = crypto.randomUUID();
      const duration = detail.duration ?? 3000;

      setToasts((current) => [...current, { id, message: detail.message, tone: detail.tone ?? 'info' }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
    };

    feedbackTarget.addEventListener(FEEDBACK_EVENTS.alert, handleAlert);
    feedbackTarget.addEventListener(FEEDBACK_EVENTS.confirm, handleConfirm);
    feedbackTarget.addEventListener(FEEDBACK_EVENTS.toast, handleToast);

    return () => {
      feedbackTarget.removeEventListener(FEEDBACK_EVENTS.alert, handleAlert);
      feedbackTarget.removeEventListener(FEEDBACK_EVENTS.confirm, handleConfirm);
      feedbackTarget.removeEventListener(FEEDBACK_EVENTS.toast, handleToast);
    };
  }, []);

  const closeAlert = () => {
    alertRequest?.resolve();
    setAlertRequest(null);
  };

  const closeConfirm = (confirmed: boolean) => {
    confirmRequest?.resolve(confirmed);
    setConfirmRequest(null);
  };

  return (
    <>
      {children}
      <Alert
        open={Boolean(alertRequest)}
        title={alertRequest?.title}
        message={alertRequest?.message ?? ''}
        confirmLabel={alertRequest?.confirmLabel}
        onClose={closeAlert}
      />
      <Confirm
        open={Boolean(confirmRequest)}
        title={confirmRequest?.title}
        message={confirmRequest?.message ?? ''}
        confirmLabel={confirmRequest?.confirmLabel}
        cancelLabel={confirmRequest?.cancelLabel}
        tone={confirmRequest?.tone}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
      <div className="toast-region" aria-live="polite" aria-relevant="additions">
        <AnimatePresence>
          {toasts.map((item) => (
            <Toast key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
