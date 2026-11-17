import { cn } from '../../utils/cn.js';

const TONE_CLASS = {
  purple: 'badge--purple',
  pink: 'badge--pink',
  green: 'badge--green',
  slate: 'badge--slate',
  amber: 'badge--amber',
  neutral: 'badge--neutral',
};

const SIZE_CLASS = {
  sm: 'badge--sm',
  md: 'badge--md',
};

/** Selo em caixa alta (a caixa alta vem do CSS: passe o texto normal). */
export default function Badge({ children, tone = 'neutral', size = 'sm', className }) {
  return <span className={cn('badge', TONE_CLASS[tone], SIZE_CLASS[size], className)}>{children}</span>;
}
