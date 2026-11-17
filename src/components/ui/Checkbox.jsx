import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Caixa de seleção (checkbox nativo escondido + caixa desenhada em CSS).
 * `onChange(checked)` recebe o boolean. `label` vira o nome acessível (obrigatório:
 * a caixa não tem texto visível). A área de toque é maior que a caixa (~32px).
 */
export default function Checkbox({ checked, onChange, label, id, disabled = false, className }) {
  return (
    <label className={cn('check', className)}>
      <input
        id={id}
        type="checkbox"
        className="check__input"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="check__box" aria-hidden="true">
        <Check className="check__icon" />
      </span>
    </label>
  );
}
