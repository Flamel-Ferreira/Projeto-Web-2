import { ListChecks } from 'lucide-react';
import {
  OVERVIEW_TEXT,
  formatCompletedBadge,
  formatTaskSummary,
} from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import TaskBadges from '../tasks/TaskBadges.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import EmptyState from '../ui/EmptyState.jsx';

/**
 * Card 2: até 3 pendências de maior prioridade (RN-11) com checkbox, mais o resumo
 * "N tarefas · N concluídas · N pendentes" (RN-19). `counts` = { total, completed, pending }.
 */
export default function PriorityTasksCard({ tasks, counts, onToggle, onCreate }) {
  return (
    <section className="overview-card" aria-labelledby="overview-tasks-title">
      <header className="overview-card__header">
        <span className="overview-card__icon overview-card__icon--primary">
          <ListChecks className="overview-card__icon-svg" aria-hidden="true" />
        </span>
        <div className="overview-card__titles">
          <h2 id="overview-tasks-title" className="overview-card__title">
            {OVERVIEW_TEXT.tasksTitle}
          </h2>
          <p className="overview-card__description">{OVERVIEW_TEXT.tasksDescription}</p>
        </div>
        <Badge tone="neutral" className="overview-card__badge">
          {formatCompletedBadge(counts.completed, counts.total)}
        </Badge>
      </header>

      <div className="overview-card__body">
        {tasks.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={ListChecks}
            title={OVERVIEW_TEXT.tasksEmptyTitle}
            description={OVERVIEW_TEXT.tasksEmptyDescription}
            action={
              <Button variant="secondary" size="sm" onClick={onCreate}>
                {OVERVIEW_TEXT.tasksEmptyAction}
              </Button>
            }
          />
        ) : (
          <ul className="overview-list">
            {tasks.map((task) => {
              const done = task.status === 'done';
              return (
                <li key={task.id} className="overview-item">
                  <Checkbox
                    checked={done}
                    label={OVERVIEW_TEXT.completeTask(task.title)}
                    onChange={() => onToggle(task.id)}
                  />
                  <div className="overview-item__content">
                    <p className={cn('overview-item__title', done && 'overview-item__title--done')}>
                      {task.title}
                    </p>
                    <TaskBadges category={task.category} priority={task.priority} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="overview-card__footer">{formatTaskSummary(counts)}</footer>
    </section>
  );
}
