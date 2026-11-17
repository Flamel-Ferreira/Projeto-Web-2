import { Pencil, Trash2 } from 'lucide-react';
import HabitDayCell from './HabitDayCell.jsx';
import StreakBadge from './StreakBadge.jsx';
import IconButton from '../ui/IconButton.jsx';
import { HABIT_CATEGORY_META, WEEK_DAYS } from '../../utils/constants.js';
import { getHabitCellState } from '../../utils/date.js';
import { HABIT_CATEGORY_ICONS, dayOfWeekOf, goalLabel } from './habitMeta.js';

export const HABIT_GRID =
  'grid grid-cols-[minmax(200px,1fr)_repeat(7,30px)_104px_72px] items-center gap-x-3';

const DAY_LABEL_BY_INDEX = Object.fromEntries(WEEK_DAYS.map((d) => [d.index, d.long]));

export default function HabitRow({ habit, weekDates, todayKey, streak, onToggle, onEdit, onDelete }) {
  const Icon = HABIT_CATEGORY_ICONS[habit.category] ?? HABIT_CATEGORY_ICONS.health;
  const categoryLabel = HABIT_CATEGORY_META[habit.category]?.label ?? '';

  return (
    <div className={`${HABIT_GRID} group border-t border-white/5 px-5 py-4 transition-colors hover:bg-white/[0.02]`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-text-secondary">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-text">{habit.name}</p>
          <p className="truncate text-xs text-text-muted">
            {categoryLabel} · {goalLabel(habit.goal)}
          </p>
        </div>
      </div>

      {weekDates.map((dateKey) => (
        <HabitDayCell
          key={dateKey}
          state={getHabitCellState(habit, dateKey, todayKey)}
          label={DAY_LABEL_BY_INDEX[dayOfWeekOf(dateKey)]}
          onClick={() => onToggle(habit.id, dateKey)}
        />
      ))}

      <div>
        <StreakBadge days={streak} />
      </div>

      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <IconButton icon={Pencil} label={`Editar hábito ${habit.name}`} variant="ghost" size="sm" onClick={() => onEdit(habit)} />
        <IconButton icon={Trash2} label={`Excluir hábito ${habit.name}`} variant="ghost" size="sm" onClick={() => onDelete(habit)} />
      </div>
    </div>
  );
}