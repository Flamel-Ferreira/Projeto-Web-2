import { Timer } from 'lucide-react';
import { OVERVIEW_TEXT, formatSessionPlan } from '../../utils/constants.js';
import ModeTabs from '../pomodoro/ModeTabs.jsx';
import PomodoroRing from '../pomodoro/PomodoroRing.jsx';
import TimerControls from '../pomodoro/TimerControls.jsx';
import Badge from '../ui/Badge.jsx';

/** Card 1: timer funcional (modo, anel, iniciar/pausar/resetar) sem sair da página (RN-55). */
export default function FocusSummaryCard({
  mode,
  setMode,
  formattedTime,
  progress,
  isRunning,
  start,
  pause,
  reset,
  sessionCount,
  cycleLength,
}) {
  return (
    <section className="overview-card" aria-labelledby="overview-focus-title">
      <header className="overview-card__header">
        <span className="overview-card__icon overview-card__icon--primary">
          <Timer className="overview-card__icon-svg" aria-hidden="true" />
        </span>
        <div className="overview-card__titles">
          <h2 id="overview-focus-title" className="overview-card__title">
            {OVERVIEW_TEXT.focusTitle}
          </h2>
          <p className="overview-card__description">{OVERVIEW_TEXT.focusDescription}</p>
        </div>
        <Badge tone="purple" className="overview-card__badge">
          {OVERVIEW_TEXT.focusBadge}
        </Badge>
      </header>

      <div className="overview-card__body overview-card__body--focus">
        <ModeTabs mode={mode} onChange={setMode} isRunning={isRunning} size="sm" />
        <PomodoroRing mode={mode} time={formattedTime} progress={progress} size="sm" />
        <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
      </div>

      <footer className="overview-card__footer">
        <span className="live-dot" aria-hidden="true" />
        {formatSessionPlan(sessionCount, cycleLength)}
      </footer>
    </section>
  );
}
