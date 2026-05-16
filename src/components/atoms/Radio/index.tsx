import type React from 'react';
import { useId } from 'react';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

const Radio = ({ label, description, id, className = '', ...props }: RadioProps) => {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  const classNames = ['choice', 'choice--radio', className].join(' ').trim();

  return (
    <label className={classNames} htmlFor={radioId}>
      <input id={radioId} className="choice__input" type="radio" {...props} />
      <span className="choice__box" aria-hidden="true" />
      <span className="choice__content">
        <span className="choice__label">{label}</span>
        {description ? <span className="choice__description">{description}</span> : null}
      </span>
    </label>
  );
};

export default Radio;
