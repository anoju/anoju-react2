import { FEEDBACK_EVENTS, feedbackTarget, type ConfirmRequest } from './feedbackEvents';

export const showConfirm = (message: string, options: Omit<ConfirmRequest, 'message' | 'resolve'> = {}) =>
  new Promise<boolean>((resolve) => {
    feedbackTarget.dispatchEvent(
      new CustomEvent<ConfirmRequest>(FEEDBACK_EVENTS.confirm, {
        detail: {
          ...options,
          message,
          resolve,
        },
      }),
    );
  });
