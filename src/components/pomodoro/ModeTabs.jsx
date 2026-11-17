import { useId, useState } from 'react';
import { POMODORO_MODE_OPTIONS, POMODORO_TEXT } from '../../utils/constants.js';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

/**
 * Abas Foco / Pausa Curta / Pausa Longa. Trocar de modo com o timer rodando
 * pede confirmação (RN-41); com o timer parado, troca direto.
 */
export default function ModeTabs({ mode, onChange, isRunning = false, size = 'md', compact = false }) {
  const name = useId();
  const [pendingMode, setPendingMode] = useState(null);
  const resolvedSize = compact ? 'sm' : size;

  const handleChange = (nextMode) => {
    if (nextMode === mode) return;
    if (isRunning) setPendingMode(nextMode);
    else onChange(nextMode);
  };

  return (
    <>
      <SegmentedControl
        name={name}
        options={POMODORO_MODE_OPTIONS}
        value={mode}
        onChange={handleChange}
        size={resolvedSize}
        ariaLabel={POMODORO_TEXT.modeGroupLabel}
      />
      <ConfirmDialog
        open={pendingMode !== null}
        title={POMODORO_TEXT.switchTitle}
        description={POMODORO_TEXT.switchDescription}
        confirmLabel={POMODORO_TEXT.switchConfirm}
        cancelLabel={POMODORO_TEXT.switchCancel}
        onCancel={() => setPendingMode(null)}
        onConfirm={() => {
          onChange(pendingMode);
          setPendingMode(null);
        }}
      />
    </>
  );
}