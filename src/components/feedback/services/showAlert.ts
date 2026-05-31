import { FEEDBACK_EVENTS, feedbackTarget, type AlertRequest } from './feedbackEvents';

export const showAlert = (message: string, options: Omit<AlertRequest, 'message' | 'resolve'> = {}) =>
  new Promise<void>((resolve) => {
    feedbackTarget.dispatchEvent(
      new CustomEvent<AlertRequest>(FEEDBACK_EVENTS.alert, {
        detail: {
          ...options,
          message,
          resolve,
        },
      }),
    );
  });
