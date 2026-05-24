import type React from 'react';
import { useId } from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

const Radio = ({ label, description, id, className = '', ...props }: RadioProps) => {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  const classNames = ['radio', className].join(' ').trim();

  return (
    <label className={classNames} htmlFor={radioId}>
      <input id={radioId} className="radio__input" type="radio" {...props} />
      <span className="radio__box" aria-hidden="true" />
      <span className="radio__content">
        <span className="radio__label">{label}</span>
        {description ? <span className="radio__description">{description}</span> : null}
      </span>
    </label>
  );
};

export default Radio;
