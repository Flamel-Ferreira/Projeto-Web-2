// ============================================================================
// HabitsContext — hábitos do usuário da sessão (SPEC §4.5, §5.3).
//
//  - `days` usa 0 = domingo e é guardado na ordem de exibição Seg→Dom (1…6, 0).
//  - Só hoje e dias passados da semana corrente podem ser alternados (RN-24),
//    e apenas em dias da frequência do hábito (RN-25).
//  - Desmarcar grava `false` e mantém a chave (RN-23).
// ============================================================================

import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  ALL_WEEK_DAY_INDEXES,
  HABIT_CATEGORY,
  HABIT_DEFAULT_CATEGORY,
  HABIT_DEFAULT_GOAL,
  LIMITS,
  MESSAGES,
  TOAST_TYPE,
} from '../utils/constants.js';
import {
  calculateStreak,
  getTodayKey,
  getWeekDates,
  isDoneOn,
  isFutureKey,
  isScheduledOn,
  nowIso,
} from '../utils/date.js';
import { newHabitId } from '../utils/ids.js';
import { storageKeys } from '../utils/storage.js';
import { validateHabitDays, validateHabitGoal, validateHabitName } from '../utils/validators.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useTodayKey } from './useTodayKey.js';
import { useUserCollection } from './useUserCollection.js';

const HabitsContext = createContext(null);

const CATEGORY_VALUES = Object.values(HABIT_CATEGORY);

// ---------------------------------------------------------------------------
// Lógica pura (exportada para teste)
// ---------------------------------------------------------------------------
/** Dias válidos (0–6), sem repetição, na ordem Seg→Dom; null se não sobrar nenhum. */
export function normalizeDays(days) {
  if (!Array.isArray(days)) return null;

  const valid = new Set(days.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6));
  return valid.size > 0 ? ALL_WEEK_DAY_INDEXES.filter((day) => valid.has(day)) : null;
}

export function sanitizeHabits(raw) {
  const seen = new Set();

  return raw
    .filter(
      (habit) =>
        habit !== null &&
        typeof habit === 'object' &&
        typeof habit.id === 'string' &&
        typeof habit.name === 'string' &&
        habit.name.trim() !== '' &&
        !seen.has(habit.id) &&
        seen.add(habit.id),
    )
    .map((habit) => {
      const goal = Number(habit.goal);
      const history = {};

      if (habit.history !== null && typeof habit.history === 'object') {
        Object.entries(habit.history).forEach(([dateKey, done]) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && typeof done === 'boolean') history[dateKey] = done;
        });
      }

      return {
        id: habit.id,
        name: habit.name.trim().slice(0, LIMITS.habitNameMax),
        category: CATEGORY_VALUES.includes(habit.category) ? habit.category : HABIT_DEFAULT_CATEGORY,
        days: normalizeDays(habit.days) ?? [...ALL_WEEK_DAY_INDEXES],
        goal:
          Number.isInteger(goal) && goal >= LIMITS.habitGoalMin && goal <= LIMITS.habitGoalMax
            ? goal
            : HABIT_DEFAULT_GOAL,
        history,
        createdAt: typeof habit.createdAt === 'string' ? habit.createdAt : nowIso(),
        archived: habit.archived === true,
      };
    });
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function HabitsProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.userId ?? null;
  const todayKey = useTodayKey();

  const { items, itemsRef, commit } = useUserCollection({
    userId,
    getKey: storageKeys.habits,
    sanitize: sanitizeHabits,
  });

  // Hábitos ativos, em ordem de criação estável (RN-30).
  const habits = useMemo(
    () =>
      items
        .filter((habit) => !habit.archived)
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    [items],
  );

  // RN-26: semana sempre Seg→Dom da semana corrente.
  const weekDates = useMemo(() => getWeekDates(todayKey), [todayKey]);

  // RN-20: hábitos de hoje = ativos cujo `days` contém o dia da semana atual.
  const todayHabits = useMemo(
    () => habits.filter((habit) => isScheduledOn(habit, todayKey)),
    [habits, todayKey],
  );

  // RN-21: concluídos hoje / obrigatórios hoje (0% quando não há obrigatórios).
  const dailyConsistency = useMemo(() => {
    const total = todayHabits.length;
    const completed = todayHabits.filter((habit) => isDoneOn(habit, todayKey)).length;
    return { percent: total > 0 ? Math.round((completed / total) * 100) : 0, completed, total };
  }, [todayHabits, todayKey]);

  const streaks = useMemo(
    () => new Map(habits.map((habit) => [habit.id, calculateStreak(habit, todayKey)])),
    [habits, todayKey],
  );

  const streakOf = useCallback((id) => streaks.get(id) ?? 0, [streaks]);

  // RN-29: maior streak entre os hábitos de hoje (0 se nenhum tem sequência).
  const currentStreak = useMemo(
    () => todayHabits.reduce((max, habit) => Math.max(max, streaks.get(habit.id) ?? 0), 0),
    [todayHabits, streaks],
  );

  const addHabit = useCallback(
    (input = {}) => {
      const name = String(input.name ?? '').trim();
      const days = input.days === undefined ? [...ALL_WEEK_DAY_INDEXES] : normalizeDays(input.days) ?? [];
      const goal = input.goal === undefined ? HABIT_DEFAULT_GOAL : Number(input.goal);

      if (validateHabitName(name) || validateHabitDays(days) || validateHabitGoal(goal)) return null;

      const current = itemsRef.current;
      const takenIds = new Set(current.map((habit) => habit.id));
      const habit = {
        id: newHabitId((id) => takenIds.has(id)),
        name,
        category: CATEGORY_VALUES.includes(input.category) ? input.category : HABIT_DEFAULT_CATEGORY,
        days,
        goal,
        history: {},
        createdAt: nowIso(),
        archived: false,
      };

      commit([...current, habit]);
      showToast(MESSAGES.habits.created, TOAST_TYPE.success);
      return habit;
    },
    [commit, itemsRef, showToast],
  );

  const updateHabit = useCallback(
    (id, patch = {}) => {
      const current = itemsRef.current;
      const habit = current.find((candidate) => candidate.id === id);
      if (!habit) return;

      const next = { ...habit };

      if (patch.name !== undefined) {
        const name = String(patch.name).trim();
        if (validateHabitName(name)) return;
        next.name = name;
      }
      if (patch.days !== undefined) {
        const days = normalizeDays(patch.days);
        if (!days) return;
        next.days = days;
      }
      if (patch.goal !== undefined) {
        const goal = Number(patch.goal);
        if (validateHabitGoal(goal)) return;
        next.goal = goal;
      }
      if (CATEGORY_VALUES.includes(patch.category)) next.category = patch.category;
      if (typeof patch.archived === 'boolean') next.archived = patch.archived;

      commit(current.map((candidate) => (candidate.id === id ? next : candidate)));
      showToast(MESSAGES.habits.updated, TOAST_TYPE.success);
    },
    [commit, itemsRef, showToast],
  );

  // RN-28: remove o hábito e todo o histórico (a confirmação fica na UI).
  const deleteHabit = useCallback(
    (id) => {
      const current = itemsRef.current;
      if (!current.some((habit) => habit.id === id)) return;

      commit(current.filter((habit) => habit.id !== id));
      showToast(MESSAGES.habits.deleted, TOAST_TYPE.success);
    },
    [commit, itemsRef, showToast],
  );

  const toggleDay = useCallback(
    (id, dateKey) => {
      const current = itemsRef.current;
      const habit = current.find((candidate) => candidate.id === id);
      if (!habit || habit.archived) return;

      // Datas conferidas no momento do clique (a virada do dia não deixa o estado velho).
      const today = getTodayKey();
      const allowed =
        getWeekDates(today).includes(dateKey) &&
        !isFutureKey(dateKey, today) && // RN-24 / D5
        isScheduledOn(habit, dateKey); // RN-25
      if (!allowed) return;

      const history = { ...habit.history, [dateKey]: !isDoneOn(habit, dateKey) }; // RN-23
      commit(current.map((candidate) => (candidate.id === id ? { ...habit, history } : candidate)));
    },
    [commit, itemsRef],
  );

  const value = useMemo(
    () => ({
      habits,
      weekDates,
      todayKey,
      todayHabits,
      dailyConsistency,
      currentStreak,
      streakOf,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleDay,
    }),
    [
      habits,
      weekDates,
      todayKey,
      todayHabits,
      dailyConsistency,
      currentStreak,
      streakOf,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleDay,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits deve ser usado dentro de <HabitsProvider>.');
  return context;
}
