import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

// Mapas com nomes LITERAIS: o Tailwind só mantém no build as classes que encontra no código.
const VARIANT_CLASS = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  outline: 'btn--outline',
  danger: 'btn--danger',
};

const SIZE_CLASS = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
};

/**
 * Botão base. `icon` / `iconRight` recebem um componente do lucide-react.
 * `loading` mostra o spinner, desabilita o botão e marca `aria-busy`.
 * Props extras (form, autoFocus, data-*, aria-*) vão direto para o <button>.
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    onClick,
    ariaLabel,
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && 'btn--full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <Loader2 className="btn__spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon className="btn__icon" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="btn__icon" aria-hidden="true" />}
    </button>
  );
});

export default Button;
