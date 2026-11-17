import {
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_TONES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_TONES,
  OVERVIEW_TEXT,
} from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import Badge from '../ui/Badge.jsx';

const DOT_CLASS = {
  slate: 'task-priority__dot--slate',
  purple: 'task-priority__dot--purple',
  pink: 'task-priority__dot--pink',
};

/** Linha "TRABALHO • Média": selo da categoria + ponto colorido e rótulo da prioridade. */
export default function TaskBadges({ category, priority, variant = 'card' }) {
  return (
    <div className={cn('task-badges', variant === 'inline' && 'gap-2')}>
      <Badge tone={TASK_CATEGORY_TONES[category]} size={variant === 'inline' ? 'sm' : undefined}>
        {TASK_CATEGORY_LABELS[category]}
      </Badge>
      <span className="task-priority">
        <span className={cn('task-priority__dot', DOT_CLASS[TASK_PRIORITY_TONES[priority]])} aria-hidden="true" />
        <span className="visually-hidden">{OVERVIEW_TEXT.priority} </span>
        {TASK_PRIORITY_LABELS[priority]}
      </span>
    </div>
  );
}