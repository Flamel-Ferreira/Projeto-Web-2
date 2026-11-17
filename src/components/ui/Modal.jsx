import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { UI_TEXT } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import IconButton from './IconButton.jsx';
import { useBodyScrollLock } from './useBodyScrollLock.js';

const SIZE_CLASS = {
  sm: 'modal--sm',
  md: 'modal--md',
  lg: 'modal--lg',
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Diálogo modal acessível (SPEC §7.3, §10):
 *  - portal no <body>, role="dialog", aria-modal, título/descrição ligados por aria-*;
 *  - foco inicial: o que o filho marcar com autoFocus; senão, o próprio diálogo;
 *  - Tab/Shift+Tab ficam presos dentro; Escape fecha; clique no fundo fecha (opcional);
 *  - scroll do body bloqueado; ao fechar, o foco volta para quem abriu.
 * Para enviar um <form> que está no corpo com um botão do rodapé, use <Button form="id-do-form" type="submit" />.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const pressStartedOnBackdrop = useRef(false);

  useBodyScrollLock(open);

  // Guarda quem tinha o foco ANTES de abrir (o autoFocus dos filhos já terá movido o foco
  // quando os efeitos rodarem, por isso a leitura é feita durante a renderização).
  if (open) {
    if (returnFocusRef.current === null && typeof document !== 'undefined') {
      returnFocusRef.current = document.activeElement;
    }
  } else {
    returnFocusRef.current = null;
  }

  useEffect(() => {
    if (!open) return undefined;

    const returnTo = returnFocusRef.current;
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();

    return () => {
      if (returnTo && typeof returnTo.focus === 'function' && document.contains(returnTo)) {
        returnTo.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose?.();
      return;
    }
    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (element) => element.getClientRects().length > 0,
    );

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        const clickedBackdrop = pressStartedOnBackdrop.current && event.target === event.currentTarget;
        pressStartedOnBackdrop.current = false;
        if (clickedBackdrop && closeOnBackdrop) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn('modal', SIZE_CLASS[size])}
        onKeyDown={handleKeyDown}
      >
        <div className="modal__header">
          <div className="modal__heading">
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="modal__description">
                {description}
              </p>
            )}
          </div>
          <IconButton icon={X} label={UI_TEXT.close} variant="ghost" size="sm" onClick={onClose} />
        </div>

        {children && <div className="modal__body">{children}</div>}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
