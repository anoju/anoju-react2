import type React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { BottomSheet } from '@/components/feedback';

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
  native?: boolean;
}

const Select = ({
  label,
  description,
  error,
  options,
  placeholder,
  fullWidth = true,
  native = false,
  id,
  className = '',
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  required,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const currentValue = String(value ?? uncontrolledValue);
  const selectedOption = options.find((option) => option.value === currentValue);
  const displayLabel = selectedOption?.label ?? placeholder ?? '선택';

  const classNames = ['field', 'field--select', fullWidth ? 'field--full' : '', className].join(' ').trim();
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled || disabled) return;

    setUncontrolledValue(option.value);
    setIsOpen(false);
    onChange?.({
      target: { value: option.value, name },
      currentTarget: { value: option.value, name },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className={classNames} data-invalid={Boolean(error) || undefined}>
      {label ? (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      {native ? (
        <div className="field__control">
          <select
            id={selectId}
            className="field__select"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            name={name}
            required={required}
            onChange={onChange}
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
      ) : (
        <>
          {name ? <input type="hidden" name={name} value={currentValue} disabled={disabled} required={required} /> : null}
          <button
            id={selectId}
            className="field__select-trigger"
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            data-state={isOpen ? 'open' : 'closed'}
            onClick={() => setIsOpen(true)}
          >
            <span data-placeholder={!selectedOption || undefined}>{displayLabel}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </button>
          <BottomSheet open={isOpen} title={label ?? '옵션 선택'} onClose={() => setIsOpen(false)}>
            <div className="select-sheet" role="listbox" aria-labelledby={selectId}>
              {placeholder ? (
                <button
                  className="select-sheet__option"
                  type="button"
                  role="option"
                  aria-selected={currentValue === ''}
                  disabled={required}
                  data-selected={currentValue === '' || undefined}
                  onClick={() => handleOptionSelect({ value: '', label: placeholder, disabled: required })}
                >
                  <span>{placeholder}</span>
                  {currentValue === '' ? <Check size={18} aria-hidden="true" /> : null}
                </button>
              ) : null}
              {options.map((option) => {
                const selected = option.value === currentValue;

                return (
                  <button
                    className="select-sheet__option"
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    data-selected={selected || undefined}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <span>{option.label}</span>
                    {selected ? <Check size={18} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </BottomSheet>
        </>
      )}
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
