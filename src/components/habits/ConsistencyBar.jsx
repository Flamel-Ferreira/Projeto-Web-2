import ProgressBar from '../ui/ProgressBar';

export default function ConsistencyBar({ percent, completed, total }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-text-secondary">Consistência diária</span>
        <span className="text-text-muted">
          {completed} de {total} {total === 1 ? 'hábito' : 'hábitos'} ·{' '}
          <strong className="font-semibold text-text">{percent}%</strong>
        </span>
      </div>
      <ProgressBar value={percent} tone="success" label="Consistência diária" />
    </div>
  );
}
