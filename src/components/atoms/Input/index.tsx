import type React from 'react';
import { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = ({
  label,
  description,
  error,
  fullWidth = true,
  leftIcon,
  rightIcon,
  id,
  className = '',
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const classNames = ['field', fullWidth ? 'field--full' : '', className].join(' ').trim();

  return (
    <div className={classNames} data-invalid={Boolean(error) || undefined}>
      {label ? (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="field__control">
        {leftIcon ? <span className="field__icon field__icon--left">{leftIcon}</span> : null}
        <input
          id={inputId}
          className="field__input"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {rightIcon ? <span className="field__icon field__icon--right">{rightIcon}</span> : null}
      </div>
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

export default Input;
