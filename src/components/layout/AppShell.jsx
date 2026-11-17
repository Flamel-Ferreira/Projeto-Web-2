import { useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { UI_TEXT } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';
import { useBodyScrollLock } from '../ui/useBodyScrollLock.js';
import MobileTopbar from './MobileTopbar.jsx';
import Sidebar from './Sidebar.jsx';

const DESKTOP_QUERY = '(min-width: 1024px)'; // breakpoint `lg`

// Para onde o foco deve ir DEPOIS que o drawer fechar e o conteúdo deixar de ser `inert`.
const FOCUS_HEADING = 'heading';
const FOCUS_MENU_BUTTON = 'menuButton';

/**
 * Layout das rotas protegidas: sidebar fixa em ≥ lg; drawer + overlay abaixo disso.
 *  - Fecha o drawer ao trocar de rota, com Escape, clicando no overlay ou ao ir para ≥ lg.
 *  - Ao trocar de rota, volta ao topo e leva o foco ao <h1> da página (SPEC §10).
 *  - Com o drawer aberto, o conteúdo fica `inert` (foco e leitores de tela só no menu);
 *    por isso o foco só é devolvido depois que o `inert` é removido.
 */
export default function AppShell() {
  const { user, logout } = useAuth();
  const { isSidebarOpen, openSidebar, closeSidebar } = useUI();
  const { pathname } = useLocation();

  const mainRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const previousPathRef = useRef(pathname);
  const focusAfterCloseRef = useRef(null);

  useBodyScrollLock(isSidebarOpen);

  const focusHeading = useCallback(() => {
    mainRef.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, []);

  // Fecha o drawer pedindo que o foco volte ao hambúrguer (Escape, overlay, botão Fechar).
  const dismissDrawer = useCallback(() => {
    focusAfterCloseRef.current = FOCUS_MENU_BUTTON;
    closeSidebar();
  }, [closeSidebar]);

  // `inert` é aplicado direto no DOM: em React 18 o atributo não é suportado como booleano
  // e, em React 19, string vazia seria tratada como false. Ao fechar o drawer, o foco
  // pendente é aplicado aqui, já com o conteúdo de novo focável.
  useEffect(() => {
    contentWrapperRef.current?.toggleAttribute('inert', isSidebarOpen);
    if (isSidebarOpen) return;

    const target = focusAfterCloseRef.current;
    focusAfterCloseRef.current = null;
    if (target === FOCUS_HEADING) focusHeading();
    else if (target === FOCUS_MENU_BUTTON) menuButtonRef.current?.focus();
  }, [isSidebarOpen, focusHeading]);

  // Rota mudou: volta ao topo, fecha o drawer e foca o título da nova página.
  useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); // ignora o scroll suave global

    if (isSidebarOpen) {
      focusAfterCloseRef.current = FOCUS_HEADING; // o <h1> ainda está inert: foca ao fechar
      closeSidebar();
    } else {
      focusHeading();
    }
  }, [pathname, isSidebarOpen, closeSidebar, focusHeading]);

  // Redimensionou para desktop com o drawer aberto: fecha.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => {
      if (event.matches) closeSidebar();
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [closeSidebar]);

  // Drawer aberto: foco no primeiro item e Escape para fechar.
  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    sidebarRef.current?.querySelector('a')?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') dismissDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, dismissDrawer]);

  const focusMainContent = useCallback(() => mainRef.current?.focus(), []);

  return (
    <div className="app-shell">
      {/* Botão (não <a href="#...">): hash links conflitam com o HashRouter. */}
      <button type="button" className="skip-link" onClick={focusMainContent}>
        {UI_TEXT.skipToContent}
      </button>

      {isSidebarOpen && <div className="app-shell__overlay" onClick={dismissDrawer} aria-hidden="true" />}

      <aside
        ref={sidebarRef}
        className={cn('app-shell__sidebar', isSidebarOpen && 'app-shell__sidebar--open')}
      >
        <Sidebar user={user} onLogout={logout} onClose={dismissDrawer} />
      </aside>

      <div ref={contentWrapperRef} className="app-shell__main">
        <MobileTopbar onOpenMenu={openSidebar} menuButtonRef={menuButtonRef} isMenuOpen={isSidebarOpen} />
        <main ref={mainRef} tabIndex={-1} className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
