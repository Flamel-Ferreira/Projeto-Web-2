import { useEffect, useMemo, useState } from 'react';
import { Check, ListChecks, Search, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import EmptyState from '../ui/EmptyState';
import TaskBadges from '../tasks/TaskBadges';
import { cn } from '../../utils/cn';

const optionBase =
  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-150 ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-primary/60';

export default function TaskPicker({ open, tasks, selectedId, onSelect, onClose }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
  }, [tasks, query]);

  const pick = (id) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Selecionar tarefa"
      description="Apenas tarefas pendentes podem ser vinculadas ao timer."
      size="sm"
    >
      <div className="space-y-3">
        <Input
          id="task-picker-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tarefa..."
          icon={Search}
        />

        <button
          type="button"
          onClick={() => pick(null)}
          aria-pressed={selectedId == null}
          className={cn(
            optionBase,
            selectedId == null
              ? 'border-primary/30 bg-primary-soft text-text'
              : 'border-transparent bg-surface-2 text-text-secondary hover:text-text',
          )}
        >
          <X size={14} aria-hidden="true" />
          <span className="flex-1 font-medium">Nenhuma tarefa</span>
          {selectedId == null && <Check size={14} className="text-primary-light" aria-hidden="true" />}
        </button>

        {tasks.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Crie uma tarefa primeiro"
            description="Adicione um cartão no quadro de tarefas para vinculá-lo ao foco."
          />
        )}

        {tasks.length > 0 && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-text-muted">Nenhuma tarefa encontrada.</p>
        )}

        {filtered.length > 0 && (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filtered.map((task) => {
              const active = task.id === selectedId;
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => pick(task.id)}
                    aria-pressed={active}
                    className={cn(
                      optionBase,
                      'flex-col items-start gap-1.5',
                      active
                        ? 'border-primary/30 bg-primary-soft'
                        : 'border-transparent bg-surface-2 hover:bg-surface-3',
                    )}
                  >
                    <span className="flex w-full items-center gap-2">
                      <span className="flex-1 truncate font-medium text-text">{task.title}</span>
                      {active && <Check size={14} className="shrink-0 text-primary-light" aria-hidden="true" />}
                    </span>
                    <TaskBadges category={task.category} priority={task.priority} variant="inline" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
