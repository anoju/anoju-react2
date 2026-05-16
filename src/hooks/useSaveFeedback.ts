import { toast } from '@/components/feedback';

export const useSaveFeedback = () => ({
  notifySaved: (message = '저장되었습니다.') => toast(message, { tone: 'success' }),
  notifySaveFailed: (message = '저장하지 못했습니다. 다시 시도해주세요.') => toast(message, { tone: 'danger' }),
});
