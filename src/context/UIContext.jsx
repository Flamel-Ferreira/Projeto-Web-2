// ============================================================================
// UIContext — somente estado efêmero do drawer mobile (não persiste).
// ============================================================================

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const value = useMemo(
    () => ({ isSidebarOpen, openSidebar, closeSidebar }),
    [isSidebarOpen, openSidebar, closeSidebar],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI deve ser usado dentro de <UIProvider>.');
  return context;
}
