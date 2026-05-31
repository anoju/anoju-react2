import { useEffect } from 'react';
import { showConfirm } from '@/components/feedback';

export const useUnsavedChanges = (dirty: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirty]);

  const confirmLeave = () => {
    if (!dirty) {
      return Promise.resolve(true);
    }

    return showConfirm('작성 중인 내용이 있습니다. 화면을 나가시겠습니까?', {
      title: '작성 내용 나가기',
      confirmLabel: '나가기',
      cancelLabel: '계속 작성',
      tone: 'danger',
    });
  };

  return { confirmLeave };
};
