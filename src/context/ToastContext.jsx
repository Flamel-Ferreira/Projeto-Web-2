// ============================================================================
// ToastContext — fila de toasts com auto-dismiss.
// Também registra o handler que transforma falhas de storage em toast de erro
// (localStorage indisponível / quota excedida — SPEC §4.1).
// ============================================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MESSAGES, TOAST_DEFAULT_DURATION, TOAST_TYPE } from '../utils/constants.js';
import { STORAGE_ERROR, setStorageErrorHandler } from '../utils/storage.js';

const ToastContext = createContext(null);

const MAX_VISIBLE_TOASTS = 4;
const ERROR_DURATION = 5000;
const STORAGE_ERROR_DURATION = 8000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const counter = useRef(0);

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = TOAST_TYPE.success, options = {}) => {
      if (!message) return null;

      counter.current += 1;
      const id = `toast_${counter.current}`;
      const duration =
        options.duration ?? (type === TOAST_TYPE.error ? ERROR_DURATION : TOAST_DEFAULT_DURATION);

      setToasts((current) => [...current, { id, message, type, duration }].slice(-MAX_VISIBLE_TOASTS));

      if (Number.isFinite(duration) && duration > 0) {
        timers.current.set(id, setTimeout(() => dismissToast(id), duration));
      }
      return id;
    },
    [dismissToast],
  );

  // Falhas de armazenamento viram toast de erro (e o app segue em modo memória).
  useEffect(() => {
    setStorageErrorHandler((kind) => {
      const message =
        kind === STORAGE_ERROR.quota ? MESSAGES.storage.quotaExceeded : MESSAGES.storage.unavailable;
      showToast(message, TOAST_TYPE.error, { duration: STORAGE_ERROR_DURATION });
    });
    return () => setStorageErrorHandler(null);
  }, [showToast]);

  // Limpa timers pendentes ao desmontar.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  return context;
}
