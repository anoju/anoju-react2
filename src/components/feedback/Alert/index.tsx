import { Button } from '@/components/atoms';
import { Dialog } from '../Dialog';

interface AlertProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  closeOnBack?: boolean;
  onClose: () => void;
}

export const Alert = ({ open, title = '안내', message, confirmLabel = '확인', closeOnBack = true, onClose }: AlertProps) => (
  <Dialog
    open={open}
    title={title}
    description={message}
    closeOnOverlayClick={false}
    closeOnBack={closeOnBack}
    overlayType="alert"
    onClose={onClose}
    footer={
      <Button type="button" fullWidth onClick={onClose}>
        {confirmLabel}
      </Button>
    }
  />
);
