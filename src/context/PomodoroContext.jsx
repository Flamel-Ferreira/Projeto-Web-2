// ============================================================================
// PomodoroContext — timer por usuário (SPEC §4.7, §5.5, D6).
//
//  - O tempo restante enquanto roda vem de `endsAt` (epoch ms), nunca de contagem
//    acumulada: recarregar a página, suspender o computador ou throttling de aba
//    em segundo plano não desviam o relógio (RN-42, RN-43).
//  - Fim do ciclo: para, toca bipe (WebAudio), emite toast, conta a sessão de foco e
//    TROCA o modo SEM iniciar sozinho: foco → pausa curta (a cada 4º foco → pausa
//    longa); pausa → foco (RN-44, D6).
//  - Trocar de usuário/logout pausa o timer do usuário anterior e carrega o do novo
//    (RN-07, RN-50). A confirmação de trocar de modo com o timer rodando (RN-41) é da UI.
//  - Precisa estar DENTRO de <TasksProvider> (tarefa vinculada, RN-48/49).
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MESSAGES,
  POMODORO_CYCLE_LENGTH,
  POMODORO_DEFAULT_STATE,
  POMODORO_DURATIONS,
  POMODORO_MODE,
  TASK_STATUS,
  TOAST_TYPE,
} from '../utils/constants.js';
import { computeRemainingSeconds, formatClock, getTodayKey, nowIso } from '../utils/date.js';
import {
  VERSIONED_STATUS,
  readVersioned,
  storageKeys,
  writeVersioned,
} from '../utils/storage.js';
import { useAuth } from './AuthContext.jsx';
import { useTasks } from './TasksContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useTodayKey } from './useTodayKey.js';

const PomodoroContext = createContext(null);

const MODE_VALUES = Object.values(POMODORO_MODE);
const TICK_INTERVAL_MS = 250;

// ---------------------------------------------------------------------------
// Estado: normalização, carga e gravação (exportado para teste)
// ---------------------------------------------------------------------------
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Converte o que veio do storage em um estado válido e reconcilia com o relógio:
 *  - rodando → recalcula `remaining` a partir de `endsAt` (RN-43);
 *  - parado com 0 → volta ao tempo cheio do modo;
 *  - dia diferente de `sessionDate` → zera `sessionCount` (virada do dia).
 */
export function normalizeTimer(raw, now = Date.now()) {
  const data = raw !== null && typeof raw === 'object' ? raw : {};
  const todayKey = getTodayKey(new Date(now));

  const mode = MODE_VALUES.includes(data.mode) ? data.mode : POMODORO_MODE.focus;
  const duration = POMODORO_DURATIONS[mode];

  const isRunning = data.isRunning === true && Number.isFinite(data.endsAt);
  const endsAt = isRunning ? data.endsAt : null;

  let remaining = Number.isFinite(data.remaining)
    ? clamp(Math.round(data.remaining), 0, duration)
    : duration;
  if (isRunning) remaining = computeRemainingSeconds(endsAt, now);
  else if (remaining <= 0) remaining = duration;

  let sessionCount = Number.isInteger(data.sessionCount) && data.sessionCount >= 0 ? data.sessionCount : 0;
  let sessionDate = typeof data.sessionDate === 'string' ? data.sessionDate : todayKey;
  if (sessionDate !== todayKey) {
    sessionCount = 0;
    sessionDate = todayKey;
  }

  return {
    ...POMODORO_DEFAULT_STATE,
    mode,
    durations: { ...POMODORO_DURATIONS },
    remaining,
    isRunning,
    endsAt,
    sessionCount,
    sessionDate,
    cycleLength: POMODORO_CYCLE_LENGTH,
    currentTaskId: typeof data.currentTaskId === 'string' ? data.currentTaskId : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
  };
}

function loadTimer(userId) {
  if (!userId) return { userId: null, loadStatus: VERSIONED_STATUS.empty, ...normalizeTimer(null) };

  const { data, status } = readVersioned(storageKeys.pomodoro(userId), { fallback: () => ({}) });
  return { userId, loadStatus: status, ...normalizeTimer(data) };
}

function persistTimer(timer) {
  if (!timer.userId) return;
  // eslint-disable-next-line no-unused-vars
  const { userId, loadStatus, ...fields } = timer;
  writeVersioned(storageKeys.pomodoro(userId), fields);
}

/** Próximo modo ao fim de um ciclo (D6): foco → curta (4º foco → longa); pausa → foco. */
export function getNextMode(mode, sessionCountAfter, cycleLength = POMODORO_CYCLE_LENGTH) {
  if (mode !== POMODORO_MODE.focus) return POMODORO_MODE.focus;
  return sessionCountAfter % cycleLength === 0 ? POMODORO_MODE.long : POMODORO_MODE.short;
}

// ---------------------------------------------------------------------------
// Bipe curto (WebAudio, sem dependência)
// ---------------------------------------------------------------------------
function createAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    return new AudioContextClass();
  } catch {
    return null;
  }
}

function playBeep(audioContext) {
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') audioContext.resume();

    const startAt = audioContext.currentTime;
    [
      { offset: 0, frequency: 880 },
      { offset: 0.22, frequency: 1174.66 },
    ].forEach(({ offset, frequency }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, startAt + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.18);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.2);
    });
  } catch {
    /* sem áudio disponível: o toast continua avisando */
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function PomodoroProvider({ children }) {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { showToast } = useToast();
  const userId = user?.userId ?? null;
  const todayKey = useTodayKey();

  const [timer, setTimer] = useState(() => loadTimer(userId));
  const [remaining, setRemaining] = useState(() => timer.remaining);

  const timerRef = useRef(timer); // versão mais recente (inclui ações do mesmo tick)
  const audioRef = useRef(null);
  const notifiedRef = useRef(null);

  // Troca de conta: carrega o timer do novo usuário (RN-50).
  if (timer.userId !== userId) {
    const loaded = loadTimer(userId);
    setTimer(loaded);
    setRemaining(loaded.remaining);
  }

  // Ao detectar que o usuário mudou (logout, troca de conta, outra aba), pausa e
  // grava o timer do usuário ANTERIOR — este efeito precisa vir antes do que
  // atualiza `timerRef`, para ainda enxergar o estado antigo (RN-07).
  useEffect(() => {
    const previous = timerRef.current;
    if (!previous.userId || previous.userId === timer.userId || !previous.isRunning) return;

    const left = computeRemainingSeconds(previous.endsAt);
    persistTimer({
      ...previous,
      isRunning: false,
      endsAt: null,
      remaining: left > 0 ? left : previous.durations[previous.mode],
      updatedAt: nowIso(),
    });
  }, [timer.userId]);

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Aviso único se o namespace do timer estava incompatível e foi reiniciado.
  useEffect(() => {
    if (timer.loadStatus !== VERSIONED_STATUS.reset || notifiedRef.current === timer) return;
    notifiedRef.current = timer;
    showToast(MESSAGES.storage.schemaReset, TOAST_TYPE.info);
  }, [timer, showToast]);

  // Aplica um novo estado: ref + storage + React + tempo exibido.
  const apply = useCallback((next) => {
    const stamped = { ...next, updatedAt: nowIso() };
    timerRef.current = stamped;
    persistTimer(stamped);
    setTimer(stamped);
    setRemaining(stamped.isRunning ? computeRemainingSeconds(stamped.endsAt) : stamped.remaining);
  }, []);

  // O AudioContext é criado/destravado num gesto do usuário (start), pois os
  // navegadores só permitem áudio depois de uma interação.
  const unlockAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = createAudioContext();
    if (audioRef.current && audioRef.current.state === 'suspended') audioRef.current.resume();
  }, []);

  // Fim do ciclo (RN-44, D6).
  const complete = useCallback(() => {
    const current = timerRef.current;
    if (!current.userId || !current.isRunning) return;

    const today = getTodayKey();
    const wasFocus = current.mode === POMODORO_MODE.focus;
    let sessionCount = current.sessionDate === today ? current.sessionCount : 0;
    if (wasFocus) sessionCount += 1;

    const nextMode = getNextMode(current.mode, sessionCount, current.cycleLength);

    apply({
      ...current,
      mode: nextMode,
      remaining: current.durations[nextMode],
      isRunning: false,
      endsAt: null,
      sessionCount,
      sessionDate: today,
    });

    playBeep(audioRef.current);
    showToast(
      wasFocus ? MESSAGES.pomodoro.focusDone : MESSAGES.pomodoro.breakDone,
      wasFocus ? TOAST_TYPE.success : TOAST_TYPE.info,
    );
  }, [apply, showToast]);

  // Relógio: enquanto roda, confere `endsAt` e só re-renderiza quando o segundo muda.
  useEffect(() => {
    if (!timer.userId || !timer.isRunning || timer.endsAt === null) return undefined;

    const check = () => {
      const current = timerRef.current;
      if (!current.isRunning || current.endsAt === null) return;

      const left = computeRemainingSeconds(current.endsAt);
      setRemaining((previous) => (previous === left ? previous : left));
      if (left <= 0) complete();
    };

    check(); // cobre o caso "recarregou depois que o tempo já tinha acabado" (RN-43)
    const interval = setInterval(check, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [timer.userId, timer.isRunning, timer.endsAt, complete]);

  // RN-49 / RN-18: tarefa concluída ou excluída deixa de ser a atual.
  useEffect(() => {
    if (!timer.userId || !timer.currentTaskId) return;

    const stillPending = tasks.some(
      (task) => task.id === timer.currentTaskId && task.status !== TASK_STATUS.done,
    );
    if (!stillPending) apply({ ...timerRef.current, currentTaskId: null });
  }, [tasks, timer.userId, timer.currentTaskId, apply]);

  // Ações ---------------------------------------------------------------------
  const start = useCallback(() => {
    const current = timerRef.current;
    if (!current.userId || current.isRunning) return;

    unlockAudio();
    const left = current.remaining > 0 ? current.remaining : current.durations[current.mode];
    apply({ ...current, remaining: left, isRunning: true, endsAt: Date.now() + left * 1000 });
  }, [apply, unlockAudio]);

  const pause = useCallback(() => {
    const current = timerRef.current;
    if (!current.userId || !current.isRunning) return;

    apply({
      ...current,
      remaining: computeRemainingSeconds(current.endsAt),
      isRunning: false,
      endsAt: null,
    });
  }, [apply]);

  // RN-45: para e restaura o tempo cheio do modo atual (não muda o modo).
  const reset = useCallback(() => {
    const current = timerRef.current;
    if (!current.userId) return;

    apply({
      ...current,
      remaining: current.durations[current.mode],
      isRunning: false,
      endsAt: null,
    });
  }, [apply]);

  // RN-41: para o timer e aplica a duração do novo modo.
  const setMode = useCallback(
    (mode) => {
      const current = timerRef.current;
      if (!current.userId || !MODE_VALUES.includes(mode) || mode === current.mode) return;

      apply({
        ...current,
        mode,
        remaining: current.durations[mode],
        isRunning: false,
        endsAt: null,
      });
    },
    [apply],
  );

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // RN-48: só tarefas pendentes podem ser vinculadas; `null` remove o vínculo.
  const selectTask = useCallback(
    (taskId) => {
      const current = timerRef.current;
      if (!current.userId) return;

      if (taskId !== null && taskId !== undefined) {
        const selectable = tasksRef.current.some(
          (task) => task.id === taskId && task.status !== TASK_STATUS.done,
        );
        if (!selectable) return;
      }

      apply({ ...current, currentTaskId: taskId ?? null });
    },
    [apply],
  );

  // Valores derivados -----------------------------------------------------------
  const duration = timer.durations[timer.mode];
  const progress = duration > 0 ? clamp(remaining / duration, 0, 1) : 0; // RN-46
  const sessionCount = timer.sessionDate === todayKey ? timer.sessionCount : 0;

  const currentTask = useMemo(
    () =>
      tasks.find((task) => task.id === timer.currentTaskId && task.status !== TASK_STATUS.done) ?? null,
    [tasks, timer.currentTaskId],
  );

  const value = useMemo(
    () => ({
      mode: timer.mode,
      duration,
      remaining,
      progress,
      isRunning: timer.isRunning,
      formattedTime: formatClock(remaining),
      sessionCount,
      cycleLength: timer.cycleLength,
      currentTask,
      setMode,
      start,
      pause,
      reset,
      selectTask,
    }),
    [
      timer.mode,
      timer.isRunning,
      timer.cycleLength,
      duration,
      remaining,
      progress,
      sessionCount,
      currentTask,
      setMode,
      start,
      pause,
      reset,
      selectTask,
    ],
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error('usePomodoro deve ser usado dentro de <PomodoroProvider>.');
  return context;
}
