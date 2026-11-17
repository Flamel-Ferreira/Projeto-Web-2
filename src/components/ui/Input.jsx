import { useId } from 'react';
import { cn } from '../../utils/cn.js';
import FieldLabel from './FieldLabel.jsx';

/**
 * Campo de texto. `onChange` recebe o evento nativo (event.target.value).
 *  - `icon`: componente lucide exibido à esquerda.
 *  - `error`: mensagem inline (marca aria-invalid e liga via aria-describedby).
 *  - `showCounter` + `maxLength`: contador "12/60" abaixo do campo.
 *  - `multiline`: renderiza <textarea> (`rows`, `mono` para fonte monoespaçada).
 */
export default function Input({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  icon: Icon,
  autoComplete,
  autoFocus,
  disabled,
  required,
  inputMode,
  maxLength,
  showCounter = false,
  multiline = false,
  rows = 5,
  mono = false,
  className,
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [error && errorId, hint && !error && hintId].filter(Boolean).join(' ') || undefined;
  const hasIcon = Boolean(Icon) && !multiline;
  const length = String(value ?? '').length;

  const controlProps = {
    id: fieldId,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    autoComplete,
    autoFocus,
    disabled,
    maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
    'aria-describedby': describedBy,
    className: cn(
      'field__input',
      hasIcon && 'field__input--icon',
      multiline && 'field__input--multiline',
      mono && 'field__input--mono',
      error && 'field__input--invalid',
    ),
  };

  return (
    <div className={cn('field', className)}>
      {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}

      <div className="field__control">
        {hasIcon && <Icon className="field__icon" aria-hidden="true" />}
        {multiline ? (
          <textarea rows={rows} {...controlProps} />
        ) : (
          <input type={type} inputMode={inputMode} {...controlProps} />
        )}
      </div>

      {(error || hint || (showCounter && maxLength)) && (
        <div className="field__meta">
          {error ? (
            <p id={errorId} className="field__error">
              {error}
            </p>
          ) : (
            hint && (
              <p id={hintId} className="field__hint">
                {hint}
              </p>
            )
          )}
          {showCounter && maxLength ? (
            <p className="field__counter" aria-hidden="true">
              {length}/{maxLength}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
