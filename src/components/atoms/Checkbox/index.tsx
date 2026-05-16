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

  const classNames = ['choice', 'choice--checkbox', className].join(' ').trim();

  return (
    <label className={classNames} htmlFor={checkboxId}>
      <input id={checkboxId} className="choice__input" type="checkbox" {...props} />
      <span className="choice__box" aria-hidden="true">
        <Check size={14} />
      </span>
      <span className="choice__content">
        <span className="choice__label">{label}</span>
        {description ? <span className="choice__description">{description}</span> : null}
      </span>
    </label>
  );
};

export default Checkbox;
