import { forwardRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskBadges from './TaskBadges';
import IconButton from '../ui/IconButton';
import { cn } from '../../utils/cn';

// Visual puro — também usado no DragOverlay (card inclinado, como no protótipo).
export const TaskCardView = forwardRef(function TaskCardView(
  { task, onToggle, onDelete, overlay = false, className, ...rest },
  ref,
) {
  const done = task.status === 'done';

  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border border-border bg-[#181819] p-3.5',
        'outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/60',
        !overlay && 'cursor-grab hover:border-white/15 active:cursor-grabbing',
        overlay && 'rotate-[2deg] scale-[1.03] cursor-grabbing border-primary/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]',
        className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Reabrir tarefa ${task.title}` : `Concluir tarefa ${task.title}`}
        onClick={() => onToggle?.(task.id)}
        className={cn(
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          done ? 'border-success bg-success text-white' : 'border-white/20 bg-transparent hover:border-primary',
        )}
      >
        {done && <Check size={12} strokeWidth={3} aria-hidden="true" />}
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <p className={cn('break-words text-[15px] font-semibold text-text', done && 'text-text/60 line-through')}>
          {task.title}
        </p>
        <TaskBadges category={task.category} priority={task.priority} />
      </div>

      {!overlay && onDelete && (
        <div className="shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <IconButton
            icon={Trash2}
            label={`Excluir tarefa ${task.title}`}
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task)}
          />
        </div>
      )}
    </div>
  );
});

export default function TaskCard({ task, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  // O próprio card é o "activator": o teclado só inicia o arraste com foco no card,
  // então Espaço no checkbox/lixeira continua funcionando normalmente.
  const setRefs = (node) => {
    setNodeRef(node);
    setActivatorNodeRef(node);
  };

  return (
    <TaskCardView
      ref={setRefs}
      task={task}
      onToggle={onToggle}
      onDelete={onDelete}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    />
  );
}
