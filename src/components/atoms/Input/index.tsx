import type React from 'react';
import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FocusTrace from '../FocusTrace';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = ({
  label,
  description,
  error,
  fullWidth = true,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  id,
  className = '',
  type,
  disabled,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const passwordToggleEnabled = showPasswordToggle ?? type === 'password';
  const inputType = passwordToggleEnabled && passwordVisible ? 'text' : type;

  const classNames = ['field', fullWidth ? 'field--full' : '', className].join(' ').trim();

  return (
    <div className={classNames} data-invalid={Boolean(error) || undefined}>
      {label ? (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="field__control field__control--focus-trace">
        {leftIcon ? <span className="field__icon field__icon--left">{leftIcon}</span> : null}
        <input
          id={inputId}
          className="field__input"
          type={inputType}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {passwordToggleEnabled ? (
          <button
            className="field__password-toggle"
            type="button"
            aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            aria-pressed={passwordVisible}
            disabled={disabled}
            onClick={() => setPasswordVisible((current) => !current)}
          >
            {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        ) : null}
        {rightIcon ? <span className="field__icon field__icon--right">{rightIcon}</span> : null}
        <FocusTrace />
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
