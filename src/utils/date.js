// ============================================================================
// date.js — hoje, semana, streak, períodos do dia e tempo relativo.
// Chaves de data (YYYY-MM-DD) usam SEMPRE a data LOCAL, nunca UTC (SPEC §4.5).
// ============================================================================

import {
  DATE_LABELS,
  HABIT_CELL_STATE,
  MONTH_ABBR,
  MONTH_NAMES,
  PERIODS,
  PERIOD_CONTEXT_PREFIX,
  WEEKDAY_NAMES,
} from './constants.js';

const MS_PER_DAY = 86_400_000;
const MAX_STREAK_LOOKBACK_DAYS = 3660; // trava de segurança (~10 anos)

const pad2 = (value) => String(value).padStart(2, '0');

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

// ---------------------------------------------------------------------------
// Conversões básicas
// ---------------------------------------------------------------------------
/** Aceita Date, timestamp, string ISO ou chave YYYY-MM-DD (esta como data local). */
export function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDateKey(value);
  }
  return new Date(value);
}

export function isValidDate(value) {
  const date = toDate(value);
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function nowIso() {
  return new Date().toISOString();
}

/** Date → "YYYY-MM-DD" na data local. */
export function toDateKey(date = new Date()) {
  const d = toDate(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "YYYY-MM-DD" → Date à meia-noite LOCAL. */
export function parseDateKey(key) {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayKey(now = new Date()) {
  return toDateKey(now);
}

/** Date/ISO → chave local do dia (ex.: para comparar com `createdAt`). */
export function isoToDateKey(value) {
  return toDateKey(toDate(value));
}

/** Soma dias de calendário (seguro em horário de verão). Devolve meia-noite local. */
export function addDays(value, amount) {
  const d = toDate(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + amount);
}

export function addDaysToKey(key, amount) {
  return toDateKey(addDays(parseDateKey(key), amount));
}

/** 0 = domingo … 6 = sábado (padrão JS). */
export function getWeekdayIndex(value) {
  return toDate(value).getDay();
}

function dayNumber(value) {
  const d = toDate(value);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY;
}

/** Diferença em dias de calendário: (later − earlier). Ex.: ontem → hoje = 1. */
export function diffInCalendarDays(later, earlier) {
  return Math.round(dayNumber(later) - dayNumber(earlier));
}

export function isSameDay(a, b) {
  return diffInCalendarDays(a, b) === 0;
}

// ---------------------------------------------------------------------------
// Semana (sempre Seg→Dom) — RN-26
// ---------------------------------------------------------------------------
/** 7 chaves YYYY-MM-DD, de segunda a domingo, da semana de `reference`. */
export function getWeekDates(reference = new Date()) {
  const ref = toDate(reference);
  const offsetFromMonday = (ref.getDay() + 6) % 7; // seg = 0 … dom = 6
  const monday = addDays(ref, -offsetFromMonday);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
}

/** Chaves YYYY-MM-DD comparam corretamente como texto. */
export function isFutureKey(dateKey, todayKey = getTodayKey()) {
  return dateKey > todayKey;
}

// ---------------------------------------------------------------------------
// Hábitos: agendamento, estado da célula e sequência (streak)
// ---------------------------------------------------------------------------
export function isScheduledOn(habit, dateKey) {
  const days = Array.isArray(habit?.days) ? habit.days : [];
  return days.includes(getWeekdayIndex(dateKey));
}

export function isDoneOn(habit, dateKey) {
  return habit?.history?.[dateKey] === true;
}

/**
 * Estado visual da célula (RN-24, RN-25):
 *  - dia fora da frequência → notRequired
 *  - dia futuro agendado → future (bloqueado, tooltip "Dia futuro")
 *  - hoje/passado → done | pending
 */
export function getHabitCellState(habit, dateKey, todayKey = getTodayKey()) {
  if (!isScheduledOn(habit, dateKey)) return HABIT_CELL_STATE.notRequired;
  if (isFutureKey(dateKey, todayKey)) return HABIT_CELL_STATE.future;
  return isDoneOn(habit, dateKey) ? HABIT_CELL_STATE.done : HABIT_CELL_STATE.pending;
}

/**
 * Sequência (RN-22): dias AGENDADOS consecutivos concluídos, de trás para a frente.
 *  - parte de hoje; se hoje é agendado e NÃO concluído, hoje é ignorado (não quebra);
 *  - dias não agendados são pulados;
 *  - quebra no primeiro dia agendado não concluído.
 */
export function calculateStreak(habit, todayKey = getTodayKey()) {
  const days = Array.isArray(habit?.days) ? habit.days : [];
  if (days.length === 0) return 0;

  let streak = 0;
  let cursor = parseDateKey(todayKey);

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i += 1) {
    const key = toDateKey(cursor);

    if (isScheduledOn(habit, key)) {
      if (isDoneOn(habit, key)) {
        streak += 1;
      } else if (i > 0) {
        break; // dia passado agendado e não concluído quebra a sequência
      }
      // i === 0: hoje pendente é ignorado
    }

    cursor = addDays(cursor, -1);
  }

  return streak;
}

// ---------------------------------------------------------------------------
// Relógio do timer
// ---------------------------------------------------------------------------
/** 1500 → "25:00" */
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${pad2(Math.floor(safe / 60))}:${pad2(safe % 60)}`;
}

/** Segundos restantes até `endsAt` (epoch ms), nunca negativo — RN-43. */
export function computeRemainingSeconds(endsAt, now = Date.now()) {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

// ---------------------------------------------------------------------------
// Visão Geral: período do dia, saudação e data por extenso
// ---------------------------------------------------------------------------
/** 05–11 → morning · 12–17 → afternoon · 18–04 → night (RN-52). */
export function getPeriod(now = new Date()) {
  const hour = toDate(now).getHours();
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  return 'night';
}

export function getGreeting(now = new Date()) {
  return PERIODS[getPeriod(now)].greeting;
}

/** "Concentração otimizada para o período matutino" */
export function getPeriodContext(now = new Date()) {
  return `${PERIOD_CONTEXT_PREFIX} ${PERIODS[getPeriod(now)].label}`;
}

/** "Domingo, 15 de Novembro" (dia da semana e mês capitalizados, como nos prints). */
export function formatLongDate(now = new Date()) {
  const d = toDate(now);
  const weekday = capitalize(WEEKDAY_NAMES[d.getDay()]);
  const month = capitalize(MONTH_NAMES[d.getMonth()]);
  return `${weekday}, ${d.getDate()} de ${month}`;
}

/** "Domingo, 15 de Novembro • Concentração otimizada para o período matutino" */
export function formatOverviewSubtitle(now = new Date()) {
  return `${formatLongDate(now)} • ${getPeriodContext(now)}`;
}

// ---------------------------------------------------------------------------
// Notas: tempo relativo (RN-33 / D9) e rótulo de última edição (RN-35)
// ---------------------------------------------------------------------------
/** "09:23" */
export function formatHourMinute(value) {
  const d = toDate(value);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Carimbo do card da lista:
 *  hoje → "09:23" · ontem → "Ontem" · 2–6 dias → "quinta-feira" · ≥ 7 dias → "21 Out"
 */
export function formatNoteTimestamp(value, now = new Date()) {
  if (!isValidDate(value)) return '';
  const date = toDate(value);
  const diff = diffInCalendarDays(now, date);

  if (diff <= 0) return formatHourMinute(date); // inclui datas futuras (relógio adiantado)
  if (diff === 1) return DATE_LABELS.yesterday;
  if (diff <= 6) return WEEKDAY_NAMES[date.getDay()];
  return `${date.getDate()} ${MONTH_ABBR[date.getMonth()]}`;
}

/**
 * Trecho de "Última edição …" do leitor:
 *  "hoje às 11:23" · "ontem às 11:23" · "quinta-feira às 11:23" · "21 Out às 11:23"
 */
export function formatNoteEditedLabel(value, now = new Date()) {
  if (!isValidDate(value)) return '';
  const date = toDate(value);
  const time = formatHourMinute(date);
  const diff = diffInCalendarDays(now, date);

  if (diff <= 0) return `${DATE_LABELS.today} ${DATE_LABELS.at} ${time}`;
  if (diff === 1) return `${DATE_LABELS.yesterdayLower} ${DATE_LABELS.at} ${time}`;
  if (diff <= 6) return `${WEEKDAY_NAMES[date.getDay()]} ${DATE_LABELS.at} ${time}`;
  return `${date.getDate()} ${MONTH_ABBR[date.getMonth()]} ${DATE_LABELS.at} ${time}`;
}
