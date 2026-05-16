import { Button } from '@/components/atoms';
import { Dialog } from '../Dialog';

interface AlertProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
}

export const Alert = ({ open, title = '안내', message, confirmLabel = '확인', onClose }: AlertProps) => (
  <Dialog
    open={open}
    title={title}
    description={message}
    closeOnOverlayClick={false}
    onClose={onClose}
    footer={
      <Button type="button" fullWidth onClick={onClose}>
        {confirmLabel}
      </Button>
    }
  />
);
