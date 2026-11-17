import { X } from 'lucide-react';
import { APP, NAV_ITEMS, UI_TEXT } from '../../utils/constants.js';
import IconButton from '../ui/IconButton.jsx';
import Brand from './Brand.jsx';
import NavItem from './NavItem.jsx';
import ProfileMenu from './ProfileMenu.jsx';

/**
 * Conteúdo da sidebar (marca, navegação, perfil). Sem ícones nos itens (D3).
 * `onClose` só é passado no drawer mobile: mostra o botão de fechar (oculto em ≥ lg).
 */
export default function Sidebar({ user, onLogout, onClose }) {
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Brand size="sm" withSubtitle />
        {onClose && (
          <IconButton
            className="sidebar__close"
            icon={X}
            label={UI_TEXT.closeMenu}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )}
      </div>

      <nav className="sidebar__nav" aria-label={UI_TEXT.mainNavigation}>
        <p className="sidebar__section-label" aria-hidden="true">
          {APP.navigationLabel}
        </p>
        <ul className="sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavItem to={item.to} label={item.label} end={item.end} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <ProfileMenu user={user} onLogout={onLogout} />
        <p className="sidebar__version">
          {APP.name} {APP.version}
        </p>
      </div>
    </div>
  );
}
