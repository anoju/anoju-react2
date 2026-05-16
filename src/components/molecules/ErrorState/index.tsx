import { Button } from '@/components/atoms';

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = '문제가 발생했습니다.',
  description = '잠시 후 다시 시도해주세요.',
  retryLabel = '다시 시도',
  onRetry,
}: ErrorStateProps) => (
  <div className="state state--error" role="alert">
    <strong className="state__title">{title}</strong>
    <p className="state__description">{description}</p>
    {onRetry ? (
      <Button type="button" variant="outline" tone="danger" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : null}
  </div>
);
