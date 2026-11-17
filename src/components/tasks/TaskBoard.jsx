import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn.jsx';
import { TaskCardView } from './TaskCard.jsx';
import { TASK_COLUMNS } from '../../utils/constants.js';

const ACCENT_DOT = {
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
};

const ptBRAnnouncements = {
  screenReaderInstructions: {
    draggable:
      'Para mover o cartão, pressione Espaço. Use as setas para escolher a posição e pressione Espaço novamente para soltar. Esc cancela.',
  },
};

export default function TaskBoard({ tasks, onMove, onAddCard, onToggle, onDelete }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Colunas preservam a ordem manual (RN-10)
  const columns = useMemo(
    () =>
      TASK_COLUMNS.map((col) => ({
        value: col.status,
        label: col.label,
        dot: ACCENT_DOT[col.accent] ?? 'bg-primary',
        tasks: tasks.filter((t) => t.status === col.status).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      })),
    [tasks],
  );

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || !activeTask) return; // fora de área válida → cancela

    const overTask = tasks.find((t) => t.id === over.id);
    let toStatus;
    let toIndex;

    if (overTask) {
      toStatus = overTask.status;
      const column = columns.find((c) => c.value === toStatus).tasks;
      toIndex = column.findIndex((t) => t.id === over.id);

      // Entre colunas: soltar na metade inferior do card insere depois dele
      if (toStatus !== activeTask.status) {
        const translated = active.rect.current.translated;
        if (translated && translated.top > over.rect.top + over.rect.height / 2) toIndex += 1;
      }
    } else {
      // Soltou sobre a área da coluna (ex.: coluna vazia) → fim da coluna
      const target = columns.find((c) => c.value === over.id);
      if (!target) return;
      toStatus = target.value;
      toIndex = target.tasks.length;
    }

    if (toStatus === activeTask.status) {
      const currentIndex = columns.find((c) => c.value === toStatus).tasks.findIndex((t) => t.id === activeTask.id);
      if (currentIndex === toIndex) return; // nada mudou
    }

    onMove(activeTask.id, toStatus, toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={ptBRAnnouncements}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {columns.map((column) => (
          <TaskColumn
            key={column.value}
            status={column.value}
            label={column.label}
            dot={column.dot}
            tasks={column.tasks}
            count={column.tasks.length}
            onAddCard={onAddCard}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeTask ? <TaskCardView task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}