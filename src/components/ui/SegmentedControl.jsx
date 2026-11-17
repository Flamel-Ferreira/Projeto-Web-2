import { cn } from '../../utils/cn.js';

const SIZE_CLASS = {
  sm: 'seg--sm',
  md: 'seg--md',
};

/**
 * Grupo de opções exclusivas (modo do timer, coluna, categoria, prioridade, abas de auth).
 * Usa <input type="radio"> de verdade: setas, Tab e leitores de tela funcionam nativamente.
 *  - `onChange(value)` recebe o VALOR da opção (não o evento).
 *  - `columns`: nº de colunas do grid (padrão: uma por opção; 2 para a grade 2×2 de categorias).
 *  - `name`: obrigatório e único por grupo na tela.
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  name,
  columns,
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaLabelledBy,
  className,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn('seg', SIZE_CLASS[size], className)}
      style={{ '--seg-columns': columns ?? options.length }}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <label key={option.value} className="seg__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="seg__input"
            />
            <span className="seg__label">
              {Icon && <Icon className="seg__icon" aria-hidden="true" />}
              <span className="seg__text">{option.label}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
