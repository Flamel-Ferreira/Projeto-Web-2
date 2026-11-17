import { Flame } from 'lucide-react';
import {
  OVERVIEW_TEXT,
  formatHabitsBadge,
  formatStreakDays,
} from '../../utils/constants.js';
import { isDoneOn } from '../../utils/date.js';
import { cn } from '../../utils/cn.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';

/**
 * Card 3: hábitos de hoje com consistência diária (RN-21), caixas de check e a
 * sequência atual (RN-29). `consistency` = { percent, completed, total }.
 */
export default function TodayHabitsCard({ habits, todayKey, consistency, currentStreak, onToggle, onViewHabits }) {
  return (
    <section className="overview-card" aria-labelledby="overview-habits-title">
      <header className="overview-card__header">
        <span className="overview-card__icon overview-card__icon--success">
          <Flame className="overview-card__icon-svg" aria-hidden="true" />
        </span>
        <div className="overview-card__titles">
          <h2 id="overview-habits-title" className="overview-card__title">
            {OVERVIEW_TEXT.habitsTitle}
          </h2>
          <p className="overview-card__description">{OVERVIEW_TEXT.habitsDescription}</p>
        </div>
        <Badge tone="green" className="overview-card__badge">
          {formatHabitsBadge(consistency.completed, consistency.total)}
        </Badge>
      </header>

      <div className="overview-card__body">
        <div className="overview-consistency">
          <div className="overview-consistency__header">
            <span className="overview-consistency__label">{OVERVIEW_TEXT.consistency}</span>
            <span className="overview-consistency__value">{consistency.percent}%</span>
          </div>
          <ProgressBar value={consistency.percent} label={OVERVIEW_TEXT.consistency} />
        </div>

        {habits.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={Flame}
            title={OVERVIEW_TEXT.habitsEmptyTitle}
            description={OVERVIEW_TEXT.habitsEmptyDescription}
            action={
              <Button variant="secondary" size="sm" onClick={onViewHabits}>
                {OVERVIEW_TEXT.habitsEmptyAction}
              </Button>
            }
          />
        ) : (
          <ul className="overview-list">
            {habits.map((habit) => {
              const done = isDoneOn(habit, todayKey);
              return (
                <li key={habit.id} className="overview-item overview-item--center">
                  <Checkbox
                    checked={done}
                    label={OVERVIEW_TEXT.markHabit(habit.name)}
                    onChange={() => onToggle(habit.id)}
                  />
                  <p className={cn('overview-item__title', done && 'overview-item__title--done')}>
                    {habit.name}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="overview-card__footer">
        {OVERVIEW_TEXT.streak} {formatStreakDays(currentStreak)}
      </footer>
    </section>
  );
}
