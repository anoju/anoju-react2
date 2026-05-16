import type React from 'react';
import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  description?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = ({
  label,
  description,
  error,
  options,
  placeholder,
  fullWidth = true,
  id,
  className = '',
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  const classNames = ['field', 'field--select', fullWidth ? 'field--full' : '', className].join(' ').trim();

  return (
    <div className={classNames} data-invalid={Boolean(error) || undefined}>
      {label ? (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className="field__control">
        <select
          id={selectId}
          className="field__select"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="field__select-icon" size={18} aria-hidden="true" />
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

export default Select;
