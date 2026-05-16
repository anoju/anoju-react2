import { Button } from '@/components/atoms';
import { Dialog } from '../Dialog';

interface ConfirmProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const Confirm = ({
  open,
  title = '확인',
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmProps) => (
  <Dialog
    open={open}
    title={title}
    description={message}
    closeOnOverlayClick={false}
    onClose={onCancel}
    footer={
      <>
        <Button type="button" variant="outline" tone="neutral" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" tone={tone} fullWidth onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  />
);
