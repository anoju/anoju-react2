import { FEEDBACK_EVENTS, feedbackTarget, type ToastRequest } from './feedbackEvents';

export const toast = (message: string, options: Omit<ToastRequest, 'message'> = {}) => {
  feedbackTarget.dispatchEvent(
    new CustomEvent<ToastRequest>(FEEDBACK_EVENTS.toast, {
      detail: {
        ...options,
        message,
      },
    }),
  );
};
