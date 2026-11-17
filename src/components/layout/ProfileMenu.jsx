import { useEffect, useId, useRef, useState } from 'react';
import { ChevronUp, LogOut } from 'lucide-react';
import { UI_TEXT, getInitial } from '../../utils/constants.js';

/**
 * Perfil no rodapé da sidebar com popover "Sair" (CA-07).
 * Escape fecha e devolve o foco ao gatilho; clique fora e Tab para fora também fecham.
 */
export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const logoutRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    logoutRef.current?.focus();

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleBlur = (event) => {
    if (open && rootRef.current && !rootRef.current.contains(event.relatedTarget)) setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <div ref={rootRef} className="profile-menu" onBlur={handleBlur}>
      {open && (
        <div id={menuId} role="menu" aria-label={UI_TEXT.profileMenu} className="profile-menu__popover">
          <div className="profile-menu__identity">
            <p className="profile-menu__popover-name">{user.displayName}</p>
            <p className="profile-menu__popover-plan">{user.plan}</p>
          </div>
          <button
            ref={logoutRef}
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={handleLogout}
          >
            <LogOut className="profile-menu__item-icon" aria-hidden="true" />
            {UI_TEXT.logout}
          </button>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className="profile-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="profile-menu__avatar" aria-hidden="true">
          {getInitial(user.displayName)}
        </span>
        <span className="profile-menu__info">
          <span className="profile-menu__name">{user.displayName}</span>
          <span className="profile-menu__plan">{user.plan}</span>
        </span>
        <ChevronUp className="profile-menu__chevron" aria-hidden="true" />
      </button>
    </div>
  );
}
