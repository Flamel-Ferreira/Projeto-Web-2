import { Pause, Play, RotateCcw } from 'lucide-react';
import { POMODORO_TEXT } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';
import IconButton from '../ui/IconButton.jsx';

/** Iniciar/Pausar (alterna) + resetar. `size`: "md" (card) ou "lg" (página Foco). */
export default function TimerControls({ isRunning, onStart, onPause, onReset, size = 'lg' }) {
  return (
    <div className="timer-controls">
      <Button
        variant="primary"
        size={size}
        icon={isRunning ? Pause : Play}
        onClick={isRunning ? onPause : onStart}
      >
        {isRunning ? POMODORO_TEXT.pause : POMODORO_TEXT.start}
      </Button>
      <IconButton
        icon={RotateCcw}
        label={POMODORO_TEXT.reset}
        variant="secondary"
        size={size}
        onClick={onReset}
      />
    </div>
  );
}