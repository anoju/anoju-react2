import type { ToastTone } from '../Toast';

export interface AlertRequest {
  title?: string;
  message: string;
  confirmLabel?: string;
  resolve: () => void;
}

export interface ConfirmRequest {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  resolve: (confirmed: boolean) => void;
}

export interface ToastRequest {
  message: string;
  tone?: ToastTone;
  duration?: number;
}

export const feedbackTarget = new EventTarget();

export const FEEDBACK_EVENTS = {
  alert: 'anoju:alert',
  confirm: 'anoju:confirm',
  toast: 'anoju:toast',
} as const;
