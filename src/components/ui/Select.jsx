import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import FieldLabel from './FieldLabel.jsx';

/**
 * <select> nativo estilizado (teclado e leitores de tela funcionam de graça).
 * `onChange` recebe o evento nativo; converta com Number() se os valores forem números.
 */
export default function Select({ id, label, name, value, onChange, options = [], disabled, className }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn('field', className)}>
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}

      <div className="field__control">
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="field__input field__input--select"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="field__chevron" aria-hidden="true" />
      </div>
    </div>
  );
}
