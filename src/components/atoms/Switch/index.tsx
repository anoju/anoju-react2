import type React from 'react';
import { useId } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

const Switch = ({ label, description, id, className = '', ...props }: SwitchProps) => {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  const classNames = ['switch', className].join(' ').trim();

  return (
    <label className={classNames} htmlFor={switchId}>
      <span className="switch__content">
        <span className="switch__label">{label}</span>
        {description ? <span className="switch__description">{description}</span> : null}
      </span>
      <input id={switchId} className="switch__input" type="checkbox" role="switch" {...props} />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
    </label>
  );
};

export default Switch;
