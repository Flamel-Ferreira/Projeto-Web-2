import { cn } from '../../utils/cn.js';

const VARIANT_CLASS = {
  card: 'empty-state--card', // página inteira (Hábitos): cartão grande com ícone em tile
  inline: 'empty-state--inline', // dentro de cards (Visão Geral): caixa compacta
};

/**
 * Estado vazio com CTA. `icon` = componente lucide; `action` = ReactNode (ex.: <Button />).
 */
export default function EmptyState({ icon: Icon, title, description, action, variant = 'card', className }) {
  return (
    <div className={cn('empty-state', VARIANT_CLASS[variant], className)}>
      {Icon &&
        (variant === 'card' ? (
          <span className="empty-state__tile">
            <Icon className="empty-state__icon" aria-hidden="true" />
          </span>
        ) : (
          <Icon className="empty-state__icon empty-state__icon--bare" aria-hidden="true" />
        ))}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
