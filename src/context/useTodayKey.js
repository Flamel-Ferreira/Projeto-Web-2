// ============================================================================
// useTodayKey — chave "YYYY-MM-DD" do dia local, atualizada na virada do dia.
// Reconfere a cada 30 s e quando a aba volta ao foco (dispositivo suspenso).
// ============================================================================

import { useEffect, useState } from 'react';
import { getTodayKey } from '../utils/date.js';

const CHECK_INTERVAL_MS = 30_000;

export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => getTodayKey());

  useEffect(() => {
    const sync = () => {
      const next = getTodayKey();
      setTodayKey((current) => (current === next ? current : next));
    };

    const interval = setInterval(sync, CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  return todayKey;
}
