import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Button from '../ui/Button.jsx';
import {
  ALL_WEEK_DAY_INDEXES,
  HABIT_CATEGORY_OPTIONS,
  HABIT_DEFAULT_CATEGORY,
  HABIT_DEFAULT_GOAL,
  HABIT_GOAL_OPTIONS,
  LIMITS,
  UI_TEXT,
  VALIDATION,
  WEEK_DAYS,
} from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

const GOAL_SELECT_OPTIONS = HABIT_GOAL_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}));

export default function HabitModal({ open, habit = null, onClose, onSubmit }) {
  const isEdit = Boolean(habit);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(HABIT_DEFAULT_CATEGORY);
  const [days, setDays] = useState([...ALL_WEEK_DAY_INDEXES]);
  const [goal, setGoal] = useState(HABIT_DEFAULT_GOAL);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? '');
    setCategory(habit?.category ?? HABIT_DEFAULT_CATEGORY); // RN-27: padrão "Saúde"
    setDays(habit?.days ? [...habit.days] : [...ALL_WEEK_DAY_INDEXES]); // RN-27: padrão = todos
    setGoal(habit?.goal ?? HABIT_DEFAULT_GOAL);
    setErrors({});
  }, [open, habit]);

  const toggleDay = (dayIndex) => {
    setDays((current) =>
      current.includes(dayIndex) ? current.filter((d) => d !== dayIndex) : [...current, dayIndex],
    );
    setErrors((e) => ({ ...e, days: undefined }));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    const next = {};
    if (!trimmed) next.name = VALIDATION.habitNameRequired;
    if (days.length === 0) next.days = VALIDATION.habitDaysRequired;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ name: trimmed, category, days: [...days], goal });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Hábito' : 'Novo Hábito'}
      description={
        isEdit
          ? 'Ajuste nome, categoria, frequência e meta do hábito.'
          : 'Defina nome, categoria, frequência e meta para acompanhar sua consistência.'
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {UI_TEXT.cancel}
          </Button>
          <Button variant="primary" icon={Save} onClick={handleSubmit}>
            Salvar Hábito
          </Button>
        </div>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <Input
          id="habit-name"
          label="Nome"
          value={name}
          onChange={(e) => {
            setName(e.target.value.slice(0, LIMITS.habitNameMax));
            setErrors((x) => ({ ...x, name: undefined }));
          }}
          placeholder="Ex.: Meditar 10 minutos"
          error={errors.name}
          hint={`${name.length}/${LIMITS.habitNameMax}`}
          autoComplete="off"
        />

        <div>
          <FieldLabel>Categoria</FieldLabel>
          <SegmentedControl
            name="habit-category"
            options={HABIT_CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            columns={2}
          />
        </div>

        <div>
          <FieldLabel>Frequência</FieldLabel>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
            {WEEK_DAYS.map((day) => {
              const active = days.includes(day.index);
              return (
                <button
                  key={day.index}
                  type="button"
                  aria-pressed={active}
                  aria-label={day.long}
                  onClick={() => toggleDay(day.index)}
                  className={cn(
                    'h-9 min-w-[52px] flex-1 rounded-lg border px-2 text-xs font-semibold transition-colors duration-150',
                    'outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    active
                      ? 'border-primary/40 bg-primary-soft text-primary-light'
                      : 'border-border bg-surface-3 text-text-muted hover:text-text',
                  )}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
          {errors.days && (
            <p className="mt-1.5 text-xs text-danger" role="alert">
              {errors.days}
            </p>
          )}
        </div>

        <Select
          id="habit-goal"
          label="Meta diária"
          value={String(goal)}
          onChange={(e) => setGoal(Number(e.target.value))}
          options={GOAL_SELECT_OPTIONS}
        />
      </form>
    </Modal>
  );
}