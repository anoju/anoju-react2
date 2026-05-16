import { useNavigate } from 'react-router-dom';
import { confirm, toast } from '@/components/feedback';

interface DeleteActionOptions {
  successPath?: string;
  hardDeleteAllowed?: boolean;
}

export const useDeleteAction = (deleteAction: () => Promise<unknown>, options: DeleteActionOptions = {}) => {
  const navigate = useNavigate();

  const requestDelete = async () => {
    const confirmed = await confirm('삭제한 내용은 목록에서 보이지 않게 됩니다. 삭제하시겠습니까?', {
      title: '삭제 확인',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
    });

    if (!confirmed) {
      return false;
    }

    await deleteAction();
    toast('삭제되었습니다.', { tone: 'success' });

    if (options.successPath) {
      navigate(options.successPath, { replace: true });
    }

    return true;
  };

  return {
    requestDelete,
    hardDeleteAllowed: options.hardDeleteAllowed ?? false,
  };
};
