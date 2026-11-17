import { BookOpen, Brain, HeartPulse, Target } from 'lucide-react';

export const HABIT_CATEGORY_ICONS = {
  health: HeartPulse,
  studies: BookOpen,
  productivity: Target,
  mind: Brain,
};

export const goalLabel = (goal) => `${goal} ${goal === 1 ? 'vez' : 'vezes'} ao dia`;

// "YYYY-MM-DD" (data local) -> 0..6 (0 = domingo)
export const dayOfWeekOf = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};
