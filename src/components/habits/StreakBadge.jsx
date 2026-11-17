import { Flame } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function StreakBadge({ days }) {
  const active = days > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-[#131315] px-2.5 py-1 text-xs font-medium',
        active ? 'text-text' : 'text-text-muted',
      )}
    >
      <Flame size={12} className={active ? 'text-success' : 'text-text-muted'} aria-hidden="true" />
      {days} {days === 1 ? 'dia' : 'dias'}
    </span>
  );
}
