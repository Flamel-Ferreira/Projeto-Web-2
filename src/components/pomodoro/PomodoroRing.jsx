import { POMODORO_STATUS, POMODORO_TEXT } from '../../utils/constants.js';
import { formatClock } from '../../utils/date.js';
import { cn } from '../../utils/cn.js';

const RADIUS = 92; // viewBox 200×200, traço de 7
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SIZE_CLASS = { sm: 'pomodoro-ring--sm', lg: 'pomodoro-ring--lg' };
const TONE_CLASS = { success: 'pomodoro-ring__status--success', warning: 'pomodoro-ring__status--warning' };

/**
 * Anel do timer (RN-46): o arco COMEÇA cheio e diminui conforme o tempo passa.
 * Suporta tanto as props da Visão Geral (`time`, `progress`, `size="sm"`)
 * quanto as da página Foco (`remaining`, `duration`, `size="lg"`, `label`, `sublabel`).
 */
export default function PomodoroRing({
  mode = 'focus',
  time,
  progress,
  remaining,
  duration,
  size = 'lg',
  label,
  sublabel,
}) {
  const status = POMODORO_STATUS[mode] ?? POMODORO_STATUS.focus;

  const displayTime = time ?? formatClock(remaining ?? 0);
  const rawProgress =
    typeof progress === 'number'
      ? progress
      : duration > 0
        ? (remaining ?? 0) / duration
        : 0;
  const clamped = Math.min(1, Math.max(0, rawProgress));
  const statusLabel = label ?? status.label;

  const sizeKey = typeof size === 'number' ? (size <= 200 ? 'sm' : 'lg') : size;

  return (
    <div
      className={cn('pomodoro-ring', SIZE_CLASS[sizeKey] ?? SIZE_CLASS.lg)}
      role="timer"
      aria-live="off"
      aria-label={`${POMODORO_TEXT.timerLabel}: ${displayTime}. ${statusLabel}`}
    >
      <svg className="pomodoro-ring__svg" viewBox="0 0 200 200" aria-hidden="true">
        <circle className="pomodoro-ring__track" cx="100" cy="100" r={RADIUS} />
        <circle
          className="pomodoro-ring__progress"
          cx="100"
          cy="100"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          opacity={clamped > 0 ? 1 : 0}
        />
      </svg>

      <div className="pomodoro-ring__content" aria-hidden="true">
        <span className="pomodoro-ring__time">{displayTime}</span>
        <span className={cn('pomodoro-ring__status', TONE_CLASS[status.tone])}>
          <span className="pomodoro-ring__status-dot" />
          {statusLabel}
        </span>
        {sublabel && <span className="pomodoro-ring__sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}