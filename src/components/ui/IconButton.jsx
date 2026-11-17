import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

const VARIANT_CLASS = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  outline: 'btn--outline',
  danger: 'btn--danger',
};

const SIZE_CLASS = {
  sm: 'icon-btn--sm',
  md: 'icon-btn--md',
  lg: 'icon-btn--lg',
};

/**
 * Botão quadrado só com ícone. `label` é OBRIGATÓRIO: vira `aria-label` e tooltip.
 */
const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', type = 'button', onClick, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn('icon-btn', VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      aria-label={label}
      title={label}
      onClick={onClick}
      {...rest}
    >
      <Icon className="icon-btn__icon" aria-hidden="true" />
    </button>
  );
});

export default IconButton;
