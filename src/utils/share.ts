import { toast } from '@/components/feedback';

export interface ShareContentParams {
  title: string;
  text?: string;
  url: string;
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error('클립보드를 사용할 수 없습니다.');
};

export const shareContent = async ({ title, text, url }: ShareContentParams) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    await copyToClipboard(url);
    toast('공유 링크를 복사했습니다.', { tone: 'success' });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    toast('공유를 실행하지 못했습니다.', { tone: 'danger' });
  }
};
