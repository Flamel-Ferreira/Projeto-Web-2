import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const STATE_LABEL = {
  done: 'concluído',
  pending: 'pendente',
  notRequired: 'não obrigatório',
  future: 'dia futuro',
};

export default function HabitDayCell({ state, label, onClick, disabled = false }) {
  const blocked = disabled || state === 'notRequired' || state === 'future';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'done'}
      aria-disabled={blocked || undefined}
      aria-label={`${label}, ${STATE_LABEL[state]}`}
      title={state === 'future' ? 'Dia futuro' : undefined}
      tabIndex={blocked ? -1 : 0}
      onClick={() => {
        if (!blocked) onClick?.();
      }}
      className={cn(
        'flex h-[30px] w-[30px] items-center justify-center rounded-lg border transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        state === 'done' &&
          'border-success/40 bg-[linear-gradient(135deg,#22C55E,#16A34A)] text-white shadow-[0_0_12px_rgba(34,197,94,0.35)]',
        state === 'pending' && 'cursor-pointer border-border bg-surface-3 hover:border-primary/50',
        state === 'notRequired' && 'cursor-default border-dashed border-white/5 bg-[#131315]',
        state === 'future' && 'cursor-not-allowed border-border bg-surface-3 opacity-40',
      )}
    >
      {state === 'done' && <Check size={14} strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}
