import type React from 'react';
import { Check } from 'lucide-react';
import { useId } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

const Checkbox = ({ label, description, id, className = '', ...props }: CheckboxProps) => {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  const classNames = ['checkbox', className].join(' ').trim();

  return (
    <label className={classNames} htmlFor={checkboxId}>
      <input id={checkboxId} className="checkbox__input" type="checkbox" {...props} />
      <span className="checkbox__box" aria-hidden="true">
        <Check size={14} />
      </span>
      <span className="checkbox__content">
        <span className="checkbox__label">{label}</span>
        {description ? <span className="checkbox__description">{description}</span> : null}
      </span>
    </label>
  );
};

export default Checkbox;
