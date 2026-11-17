import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

/**
 * Item de navegação só com texto (sem ícone — D3). O NavLink já expõe
 * `aria-current="page"` no item ativo; `end` evita que "/" fique ativo em todas as rotas.
 */
export default function NavItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn('nav-item', isActive && 'nav-item--active')}
    >
      {label}
    </NavLink>
  );
}
