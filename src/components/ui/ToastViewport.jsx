import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { UI_TEXT } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import IconButton from './IconButton.jsx';

// Nomes de classe literais (o Tailwind precisa enxergá-los no código).
const TYPE_STYLE = {
  success: { Icon: CheckCircle2, iconClass: 'toast__icon--success', barClass: 'toast__progress--success' },
  error: { Icon: AlertCircle, iconClass: 'toast__icon--error', barClass: 'toast__progress--error' },
  info: { Icon: Info, iconClass: 'toast__icon--info', barClass: 'toast__progress--info' },
};

/**
 * Pilha de toasts no canto superior direito. A região `aria-live="polite"` fica sempre
 * montada (leitores de tela só anunciam mudanças em regiões que já existiam).
 */
export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return createPortal(
    <div className="toast-viewport" role="region" aria-label={UI_TEXT.notifications} aria-live="polite">
      {toasts.map((toast) => {
        const { Icon, iconClass, barClass } = TYPE_STYLE[toast.type] ?? TYPE_STYLE.info;
        const hasTimer = Number.isFinite(toast.duration) && toast.duration > 0;

        return (
          <div key={toast.id} className="toast" data-type={toast.type}>
            <Icon className={cn('toast__icon', iconClass)} aria-hidden="true" />
            <p className="toast__message">{toast.message}</p>
            <IconButton
              icon={X}
              label={UI_TEXT.closeToast}
              variant="ghost"
              size="sm"
              onClick={() => dismissToast(toast.id)}
            />
            {hasTimer && (
              <span
                className={cn('toast__progress', barClass)}
                style={{ '--toast-duration': `${toast.duration}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
