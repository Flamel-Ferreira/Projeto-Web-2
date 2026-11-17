import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { cn } from '../../utils/cn';

export default function TaskColumn({ status, label, dot, tasks, count, onAddCard, onToggle, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      aria-label={`${label}, ${count} ${count === 1 ? 'cartão' : 'cartões'}`}
      className="flex min-w-[85vw] snap-start flex-col rounded-2xl border border-border bg-[#101011] p-4 sm:min-w-[340px] lg:min-w-0"
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-text">{label}</h2>
        </div>
        <span className="min-w-[24px] rounded-full bg-[#232325] px-2 py-0.5 text-center text-xs font-medium text-text-secondary">
          {count}
        </span>
      </header>

      <div ref={setNodeRef} className="flex min-h-[120px] flex-1 flex-col">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center text-xs text-text-muted transition-colors',
                isOver ? 'border-primary/60 bg-primary-soft' : 'border-white/15',
              )}
            >
              Nenhum cartão nesta coluna
            </div>
          ) : (
            <ul className="flex flex-1 flex-col gap-3">
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} />
                </li>
              ))}
            </ul>
          )}
        </SortableContext>
      </div>

      <button
        type="button"
        onClick={() => onAddCard(status)}
        className="mt-3 flex items-center gap-2 rounded-lg px-1 py-2 text-xs text-text-muted outline-none transition-colors hover:text-primary-light focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <Plus size={14} aria-hidden="true" />
        Adicionar cartão
      </button>
    </section>
  );
}
