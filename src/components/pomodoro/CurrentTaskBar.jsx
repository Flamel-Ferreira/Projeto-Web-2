import { ArrowUpRight, CircleDot, X } from 'lucide-react';

export default function CurrentTaskBar({ task, onOpenPicker, onClear }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
      <CircleDot size={16} className="shrink-0 text-text-muted" aria-hidden="true" />

      {task ? (
        <>
          <p className="min-w-0 flex-1 truncate text-sm text-text-secondary">
            Tarefa atual: <span className="font-medium text-text">{task.title}</span>
          </p>
          <button
            type="button"
            onClick={onOpenPicker}
            className="flex shrink-0 items-center gap-1 rounded-md text-xs font-semibold text-primary-light outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Trocar <ArrowUpRight size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remover tarefa vinculada"
            className="shrink-0 rounded-md p-1 text-text-muted outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <p className="min-w-0 flex-1 truncate text-sm text-text-muted">Nenhuma tarefa selecionada</p>
          <button
            type="button"
            onClick={onOpenPicker}
            className="shrink-0 rounded-md text-xs font-semibold text-primary-light outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Escolher tarefa
          </button>
        </>
      )}
    </div>
  );
}
