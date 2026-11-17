import HabitRow, { HABIT_GRID } from './HabitRow.jsx';
import { WEEK_DAYS } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import { dayOfWeekOf } from './habitMeta.js';

export default function HabitTable({ habits, weekDates, todayKey, streakOf, onToggle, onEdit, onDelete }) {
  const todayDow = dayOfWeekOf(todayKey);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className={`${HABIT_GRID} px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted`}>
            <span>Hábito</span>
            {WEEK_DAYS.map((day) => (
              <span
                key={day.index}
                className={cn('text-center', day.index === todayDow && 'font-semibold text-primary-light')}
              >
                {day.short}
              </span>
            ))}
            <span>Sequência</span>
            <span aria-hidden="true" />
          </div>

          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDates={weekDates}
              todayKey={todayKey}
              streak={streakOf(habit.id)}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}