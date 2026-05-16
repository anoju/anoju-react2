import type React from 'react';
import { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = ({
  label,
  description,
  error,
  fullWidth = true,
  id,
  className = '',
  ...props
}: TextAreaProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const descriptionId = description ? `${textareaId}-description` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  const classNames = ['field', 'field--textarea', fullWidth ? 'field--full' : '', className].join(' ').trim();

  return (
    <div className={classNames} data-invalid={Boolean(error) || undefined}>
      {label ? (
        <label className="field__label" htmlFor={textareaId}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className="field__textarea"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {description ? (
        <p className="field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default TextArea;
