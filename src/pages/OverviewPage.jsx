import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusSummaryCard from '../components/overview/FocusSummaryCard.jsx';
import OverviewHeader from '../components/overview/OverviewHeader.jsx';
import PriorityTasksCard from '../components/overview/PriorityTasksCard.jsx';
import QuoteBar from '../components/overview/QuoteBar.jsx';
import TodayHabitsCard from '../components/overview/TodayHabitsCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useHabits } from '../context/HabitsContext.jsx';
import { usePomodoro } from '../context/PomodoroContext.jsx';
import { useTasks } from '../context/TasksContext.jsx';
import { APP, QUOTE, ROUTES, formatTaskSummary, getFirstName } from '../utils/constants.js';
import { formatLongDate, getGreeting, getPeriodContext } from '../utils/date.js';

const CLOCK_REFRESH_MS = 60_000;

/** Relógio que atualiza a cada minuto, para saudação e período trocarem sozinhos (RN-52). */
function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), CLOCK_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  return now;
}

/**
 * Visão Geral: resume Foco, Tarefas e Hábitos em tempo real (RN-54) e deixa
 * agir direto nos cards (iniciar timer, concluir tarefa, marcar hábito).
 */
export default function OverviewPage() {
  const { user } = useAuth();
  const { counts, priorityTasks, toggleComplete } = useTasks();
  const { todayKey, todayHabits, dailyConsistency, currentStreak, toggleDay } = useHabits();
  const pomodoro = usePomodoro();
  const navigate = useNavigate();
  const now = useNow();

  return (
    <section tabIndex={-1}>
      <OverviewHeader
        greeting={getGreeting(now)}
        name={getFirstName(user?.displayName)}
        dateLabel={formatLongDate(now)}
        periodLabel={getPeriodContext(now)}
        taskSummary={formatTaskSummary(counts)}
      />

      <div className="overview-grid">
        <FocusSummaryCard
          mode={pomodoro.mode}
          setMode={pomodoro.setMode}
          formattedTime={pomodoro.formattedTime}
          progress={pomodoro.progress}
          isRunning={pomodoro.isRunning}
          start={pomodoro.start}
          pause={pomodoro.pause}
          reset={pomodoro.reset}
          sessionCount={pomodoro.sessionCount}
          cycleLength={pomodoro.cycleLength}
        />

        <PriorityTasksCard
          tasks={priorityTasks(3)}
          counts={counts}
          summary={formatTaskSummary(counts)}
          onToggle={toggleComplete}
          onCreate={() => navigate(ROUTES.tasks)}
        />

        <TodayHabitsCard
          habits={todayHabits}
          todayKey={todayKey}
          consistency={dailyConsistency}
          currentStreak={currentStreak}
          onToggle={(habitId) => toggleDay(habitId, todayKey)}
          onViewHabits={() => navigate(ROUTES.habits)}
        />
      </div>

      <QuoteBar quote={QUOTE.text} author={QUOTE.author} version={`${APP.name} ${APP.version}`} />
    </section>
  );
}