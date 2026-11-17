import { cn } from '../../utils/cn';

export default function NoteListItem({ note, active, preview, timeLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'block w-full border-l-[3px] px-[14px] py-[14px] text-left transition-colors duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60',
        active ? 'border-primary bg-[#1B1B1D]' : 'border-transparent hover:bg-white/[0.03]',
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-semibold text-text">{note.title}</span>
        <span className="shrink-0 text-[11px] text-text-muted">{timeLabel}</span>
      </div>
      {preview && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">{preview}</p>}
    </button>
  );
}
