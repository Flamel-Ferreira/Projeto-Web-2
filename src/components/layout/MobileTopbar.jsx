import { Menu } from 'lucide-react';
import { UI_TEXT } from '../../utils/constants.js';
import IconButton from '../ui/IconButton.jsx';
import Brand from './Brand.jsx';

/** Barra superior (< lg): hambúrguer que abre o drawer + marca. */
export default function MobileTopbar({ onOpenMenu, menuButtonRef, isMenuOpen = false }) {
  return (
    <header className="mobile-topbar">
      <IconButton
        ref={menuButtonRef}
        icon={Menu}
        label={UI_TEXT.openMenu}
        variant="ghost"
        aria-expanded={isMenuOpen}
        onClick={onOpenMenu}
      />
      <Brand size="sm" withSubtitle={false} />
    </header>
  );
}
