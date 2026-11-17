import { cn } from '../../utils/cn.js';

const TONE_CLASS = {
  success: 'progress__fill--success',
  primary: 'progress__fill--primary',
};

/** Barra de progresso acessível. `value` é um número de 0 a 100 (valores fora são limitados). */
export default function ProgressBar({ value = 0, tone = 'success', label, className }) {
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
      aria-label={label}
      className={cn('progress', className)}
    >
      <div className={cn('progress__fill', TONE_CLASS[tone])} style={{ '--progress': safe }} />
    </div>
  );
}
