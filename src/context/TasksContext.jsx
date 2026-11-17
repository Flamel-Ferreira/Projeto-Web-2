// ============================================================================
// TasksContext — tarefas do usuário da sessão (SPEC §4.4, §5.2).
//
//  - `tasks` segue a ordenação padrão (RN-10): prioridade desc → order asc → createdAt asc.
//  - `byStatus(status)` devolve a coluna na ORDEM MANUAL (`order`), usada pelo Kanban.
//  - Contagens são derivadas, nunca persistidas (RN-19).
//  - Confirmação de exclusão (RN-18) é responsabilidade da UI (ConfirmDialog).
// ============================================================================

import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  LIMITS,
  MESSAGES,
  TASK_CATEGORY,
  TASK_PRIORITY,
  TASK_PRIORITY_WEIGHT,
  TASK_STATUS,
  TOAST_TYPE,
} from '../utils/constants.js';
import { nowIso } from '../utils/date.js';
import { newTaskId } from '../utils/ids.js';
import { storageKeys } from '../utils/storage.js';
import { validateTaskTitle } from '../utils/validators.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useUserCollection } from './useUserCollection.js';

const TasksContext = createContext(null);

const STATUS_VALUES = Object.values(TASK_STATUS);
const CATEGORY_VALUES = Object.values(TASK_CATEGORY);
const PRIORITY_VALUES = Object.values(TASK_PRIORITY);

// ---------------------------------------------------------------------------
// Lógica pura (exportada para teste)
// ---------------------------------------------------------------------------
const byCreatedAt = (a, b) => String(a.createdAt).localeCompare(String(b.createdAt));

/** Ordem manual de uma coluna: order asc, depois createdAt asc. */
export function sortTasksManual(a, b) {
  return a.order - b.order || byCreatedAt(a, b);
}

/** Ordenação padrão (RN-10): prioridade desc → order asc → createdAt asc. */
export function sortTasksDefault(a, b) {
  return (
    TASK_PRIORITY_WEIGHT[b.priority] - TASK_PRIORITY_WEIGHT[a.priority] ||
    a.order - b.order ||
    byCreatedAt(a, b)
  );
}

/** Descarta registros inválidos e corrige campos fora do enum (storage editado à mão). */
export function sanitizeTasks(raw) {
  const seen = new Set();

  return raw
    .filter(
      (task) =>
        task !== null &&
        typeof task === 'object' &&
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        task.title.trim() !== '' &&
        !seen.has(task.id) &&
        seen.add(task.id),
    )
    .map((task, index) => {
      const status = STATUS_VALUES.includes(task.status) ? task.status : TASK_STATUS.todo;
      const createdAt = typeof task.createdAt === 'string' ? task.createdAt : nowIso();
      const updatedAt = typeof task.updatedAt === 'string' ? task.updatedAt : createdAt;

      return {
        id: task.id,
        title: task.title.trim().slice(0, LIMITS.taskTitleMax),
        status,
        category: CATEGORY_VALUES.includes(task.category) ? task.category : TASK_CATEGORY.work,
        priority: PRIORITY_VALUES.includes(task.priority) ? task.priority : TASK_PRIORITY.medium,
        order: Number.isInteger(task.order) && task.order >= 0 ? task.order : index,
        createdAt,
        updatedAt,
        completedAt:
          status === TASK_STATUS.done
            ? typeof task.completedAt === 'string'
              ? task.completedAt
              : updatedAt
            : null,
      };
    });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Move uma tarefa para `toStatus` na posição `toIndex` (RN-16) e recalcula `order`
 * como índice sequencial nas colunas afetadas. Ajusta `completedAt` ao entrar/sair
 * de "Concluído". Devolve a nova lista, ou null se nada mudou.
 *
 * `toIndex` é a posição FINAL desejada dentro da coluna de destino; sem ele, vai para o fim.
 */
export function moveTaskInList(items, id, toStatus, toIndex, now = nowIso()) {
  const task = items.find((candidate) => candidate.id === id);
  if (!task || !STATUS_VALUES.includes(toStatus)) return null;

  const columnOf = (status) =>
    items.filter((candidate) => candidate.status === status).sort(sortTasksManual);

  const fullSource = columnOf(task.status);
  const source = fullSource.filter((candidate) => candidate.id !== id);
  const sameColumn = task.status === toStatus;
  const destination = sameColumn ? source : columnOf(toStatus);

  const index = clamp(Number.isInteger(toIndex) ? toIndex : destination.length, 0, destination.length);

  if (sameColumn && fullSource.findIndex((candidate) => candidate.id === id) === index) {
    return null; // mesma coluna, mesma posição
  }

  const moved = {
    ...task,
    status: toStatus,
    updatedAt: now,
    completedAt:
      toStatus === TASK_STATUS.done ? (task.status === TASK_STATUS.done ? task.completedAt : now) : null,
  };

  const nextDestination = [...destination.slice(0, index), moved, ...destination.slice(index)];

  const updates = new Map();
  const renumber = (list) =>
    list.forEach((item, position) => {
      updates.set(item.id, item.order === position ? item : { ...item, order: position });
    });

  renumber(nextDestination);
  if (!sameColumn) renumber(source);

  return items.map((item) => updates.get(item.id) ?? item);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function TasksProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.userId ?? null;

  const { items, itemsRef, commit } = useUserCollection({
    userId,
    getKey: storageKeys.tasks,
    sanitize: sanitizeTasks,
  });

  // Seletores derivados -------------------------------------------------------
  const tasks = useMemo(() => [...items].sort(sortTasksDefault), [items]);

  const columns = useMemo(() => {
    const grouped = { todo: [], in_progress: [], done: [] };
    [...items].sort(sortTasksManual).forEach((task) => grouped[task.status].push(task));
    return grouped;
  }, [items]);

  const counts = useMemo(() => {
    const todo = columns.todo.length;
    const inProgress = columns.in_progress.length;
    const done = columns.done.length;
    const total = todo + inProgress + done;

    return {
      todo,
      in_progress: inProgress,
      done,
      total,
      completed: done,
      pending: total - done,
    };
  }, [columns]);

  const byStatus = useCallback((status) => columns[status] ?? [], [columns]);

  // RN-11: até `limit` tarefas NÃO concluídas — `tasks` já está em ordem de prioridade.
  const priorityTasks = useCallback(
    (limit = 3) => tasks.filter((task) => task.status !== TASK_STATUS.done).slice(0, limit),
    [tasks],
  );

  // Ações ---------------------------------------------------------------------
  const addTask = useCallback(
    (input = {}) => {
      const title = String(input.title ?? '').trim();
      if (validateTaskTitle(title)) return null;

      const current = itemsRef.current;
      const status = STATUS_VALUES.includes(input.status) ? input.status : TASK_STATUS.todo;
      const lastOrder = current
        .filter((task) => task.status === status)
        .reduce((max, task) => Math.max(max, task.order), -1);

      const now = nowIso();
      const takenIds = new Set(current.map((task) => task.id));
      const task = {
        id: newTaskId((id) => takenIds.has(id)),
        title,
        status,
        category: CATEGORY_VALUES.includes(input.category) ? input.category : TASK_CATEGORY.work,
        priority: PRIORITY_VALUES.includes(input.priority) ? input.priority : TASK_PRIORITY.medium,
        order: lastOrder + 1, // entra no fim da coluna
        createdAt: now,
        updatedAt: now,
        completedAt: status === TASK_STATUS.done ? now : null,
      };

      commit([...current, task]);
      showToast(MESSAGES.tasks.created, TOAST_TYPE.success);
      return task;
    },
    [commit, itemsRef, showToast],
  );

  const updateTask = useCallback(
    (id, patch = {}) => {
      const current = itemsRef.current;
      const task = current.find((candidate) => candidate.id === id);
      if (!task) return;

      const next = { ...task };

      if (patch.title !== undefined) {
        const title = String(patch.title).trim();
        if (validateTaskTitle(title)) return;
        next.title = title;
      }
      if (CATEGORY_VALUES.includes(patch.category)) next.category = patch.category;
      if (PRIORITY_VALUES.includes(patch.priority)) next.priority = patch.priority;
      next.updatedAt = nowIso();

      let list = current.map((candidate) => (candidate.id === id ? next : candidate));

      // Mudar a coluna passa pela mesma regra do drag & drop (order e completedAt).
      if (STATUS_VALUES.includes(patch.status) && patch.status !== task.status) {
        list = moveTaskInList(list, id, patch.status) ?? list;
      }

      commit(list);
      showToast(MESSAGES.tasks.updated, TOAST_TYPE.success);
    },
    [commit, itemsRef, showToast],
  );

  const deleteTask = useCallback(
    (id) => {
      const current = itemsRef.current;
      const task = current.find((candidate) => candidate.id === id);
      if (!task) return;

      const remaining = current.filter((candidate) => candidate.id !== id);
      const renumbered = new Map(
        remaining
          .filter((candidate) => candidate.status === task.status)
          .sort(sortTasksManual)
          .map((candidate, position) => [
            candidate.id,
            candidate.order === position ? candidate : { ...candidate, order: position },
          ]),
      );

      commit(remaining.map((candidate) => renumbered.get(candidate.id) ?? candidate));
      showToast(MESSAGES.tasks.deleted, TOAST_TYPE.success);
      // O vínculo com o Pomodoro é limpo pelo PomodoroContext (RN-18, RN-49).
    },
    [commit, itemsRef, showToast],
  );

  const moveTask = useCallback(
    (id, toStatus, toIndex) => {
      const next = moveTaskInList(itemsRef.current, id, toStatus, toIndex);
      if (next) commit(next);
    },
    [commit, itemsRef],
  );

  // RN-15: concluir → done + completedAt; reabrir → volta para "A Fazer" e limpa completedAt.
  const toggleComplete = useCallback(
    (id) => {
      const task = itemsRef.current.find((candidate) => candidate.id === id);
      if (!task) return;
      moveTask(id, task.status === TASK_STATUS.done ? TASK_STATUS.todo : TASK_STATUS.done);
    },
    [itemsRef, moveTask],
  );

  const value = useMemo(
    () => ({
      tasks,
      counts,
      byStatus,
      priorityTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleComplete,
      moveTask,
    }),
    [tasks, counts, byStatus, priorityTasks, addTask, updateTask, deleteTask, toggleComplete, moveTask],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks deve ser usado dentro de <TasksProvider>.');
  return context;
}
