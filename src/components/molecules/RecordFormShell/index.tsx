import type React from 'react';
import { Button } from '@/components/atoms';

interface RecordFormShellProps {
  mode: 'create' | 'edit';
  title: string;
  description?: string;
  submitting?: boolean;
  children: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
}

export const RecordFormShell = ({
  mode,
  title,
  description,
  submitting = false,
  children,
  onSubmit,
  onCancel,
}: RecordFormShellProps) => (
  <form className="record-form" onSubmit={onSubmit}>
    <header className="record-form__header">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
    <div className="record-form__body">{children}</div>
    <div className="record-form__actions">
      {onCancel ? (
        <Button type="button" variant="outline" tone="neutral" onClick={onCancel}>
          취소
        </Button>
      ) : null}
      <Button type="submit" loading={submitting}>
        {mode === 'create' ? '등록' : '저장'}
      </Button>
    </div>
  </form>
);
