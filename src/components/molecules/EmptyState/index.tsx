import { Button } from '@/components/atoms';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="state state--empty">
    <strong className="state__title">{title}</strong>
    {description ? <p className="state__description">{description}</p> : null}
    {actionLabel && onAction ? (
      <Button type="button" variant="soft" tone="neutral" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
