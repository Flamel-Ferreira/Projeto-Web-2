import { Check } from 'lucide-react';
import { AUTH_TEXT } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import { getPasswordChecks, getPasswordStrength } from '../../utils/validators.js';

// Nomes literais (o Tailwind precisa enxergá-los no código).
const BAR_TONE = {
  danger: 'password-strength__bar--danger',
  warning: 'password-strength__bar--warning',
  success: 'password-strength__bar--success',
};
const LEVEL_TONE = {
  danger: 'password-strength__level--danger',
  warning: 'password-strength__level--warning',
  success: 'password-strength__level--success',
};

/**
 * Medidor de força (4 segmentos, 3 níveis) + checklist dos 4 requisitos (RN-02).
 * O nível é anunciado por leitores de tela via `aria-live="polite"`.
 */
export default function PasswordStrength({ password = '' }) {
  const strength = getPasswordStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <div className="password-strength">
      <div className="password-strength__header">
        <span className="password-strength__title">{AUTH_TEXT.strengthTitle}</span>
        <span
          className={cn('password-strength__level', password && LEVEL_TONE[strength.tone])}
          aria-live="polite"
        >
          {strength.label}
        </span>
      </div>

      <div className="password-strength__bars" aria-hidden="true">
        {Array.from({ length: strength.totalSegments }, (_, index) => (
          <span
            key={index}
            className={cn('password-strength__bar', index < strength.filledSegments && BAR_TONE[strength.tone])}
          />
        ))}
      </div>

      <ul className="password-strength__rules">
        {checks.map((rule) => (
          <li
            key={rule.id}
            className={cn('password-strength__rule', rule.passed && 'password-strength__rule--met')}
          >
            <span className="password-strength__dot" aria-hidden="true">
              {rule.passed && <Check className="password-strength__check" />}
            </span>
            <span className="visually-hidden">
              {rule.passed ? AUTH_TEXT.ruleMet : AUTH_TEXT.rulePending}{' '}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
