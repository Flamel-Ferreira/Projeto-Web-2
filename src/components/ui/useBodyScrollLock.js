// ============================================================================
// useBodyScrollLock — bloqueia o scroll do <body> enquanto `active` for true.
// Usa contador: modal sobre modal (ou drawer + modal) só libera quando o último fecha.
// ============================================================================

import { useEffect } from 'react';

let activeLocks = 0;

export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    activeLocks += 1;
    document.body.classList.add('no-scroll');

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks === 0) document.body.classList.remove('no-scroll');
    };
  }, [active]);
}
