import { useMemo, useState } from 'react';
import { usePomodoro } from '../context/PomodoroContext.jsx';
import { useTasks } from '../context/TasksContext.jsx';
import ModeTabs from '../components/pomodoro/ModeTabs.jsx';
import PomodoroRing from '../components/pomodoro/PomodoroRing.jsx';
import TimerControls from '../components/pomodoro/TimerControls.jsx';
import CurrentTaskBar from '../components/pomodoro/CurrentTaskBar.jsx';
import TaskPicker from '../components/pomodoro/TaskPicker.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import {
  POMODORO_STATUS,
  POMODORO_TEXT,
  TASK_STATUS,
  formatSessionShort,
} from '../utils/constants.js';

export default function FocusPage() {
  const {
    mode,
    duration,
    remaining,
    isRunning,
    sessionCount,
    cycleLength,
    currentTask,
    setMode,
    start,
    pause,
    reset,
    selectTask,
  } = usePomodoro();
  const { tasks } = useTasks();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  // RN-48: apenas tarefas não concluídas (todo + em andamento)
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== TASK_STATUS.done),
    [tasks],
  );

  // RN-41: confirmar somente se o timer estiver rodando
  const handleModeChange = (next) => {
    if (next === mode) return;
    if (isRunning) setPendingMode(next);
    else setMode(next);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[420px] flex-col items-center justify-center gap-8 py-6">
      <h1 className="sr-only" tabIndex={-1}>
        Foco
      </h1>

      <ModeTabs mode={mode} onChange={handleModeChange} />

      <PomodoroRing
        remaining={remaining}
        duration={duration}
        isRunning={isRunning}
        mode={mode}
        label={POMODORO_STATUS[mode]?.label}
        sublabel={formatSessionShort(sessionCount, cycleLength)}
      />

      <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />

      <CurrentTaskBar
        task={currentTask}
        onOpenPicker={() => setPickerOpen(true)}
        onClear={() => selectTask(null)}
      />

      <TaskPicker
        open={pickerOpen}
        tasks={pendingTasks}
        selectedId={currentTask?.id ?? null}
        onSelect={selectTask}
        onClose={() => setPickerOpen(false)}
      />

      <ConfirmDialog
        open={pendingMode !== null}
        title={POMODORO_TEXT.switchTitle}
        description={POMODORO_TEXT.switchDescription}
        confirmLabel={POMODORO_TEXT.switchConfirm}
        cancelLabel={POMODORO_TEXT.switchCancel}
        onConfirm={() => {
          setMode(pendingMode);
          setPendingMode(null);
        }}
        onCancel={() => setPendingMode(null)}
      />
    </section>
  );
}