// ============================================================================
// AppProviders — composição de todos os providers.
// A ordem importa: cada provider só enxerga os que estão ACIMA dele.
//   Toast → UI → Auth → Tasks → Habits → Notes → Pomodoro (usa Tasks)
// O ToastViewport fica dentro de todos eles, então toasts aparecem também nas
// telas de login/cadastro (fora do AppShell).
// ============================================================================

import ToastViewport from '../components/ui/ToastViewport.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { HabitsProvider } from './HabitsContext.jsx';
import { NotesProvider } from './NotesContext.jsx';
import { PomodoroProvider } from './PomodoroContext.jsx';
import { TasksProvider } from './TasksContext.jsx';
import { ToastProvider } from './ToastContext.jsx';
import { UIProvider } from './UIContext.jsx';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <UIProvider>
        <AuthProvider>
          <TasksProvider>
            <HabitsProvider>
              <NotesProvider>
                <PomodoroProvider>
                  {children}
                  <ToastViewport />
                </PomodoroProvider>
              </NotesProvider>
            </HabitsProvider>
          </TasksProvider>
        </AuthProvider>
      </UIProvider>
    </ToastProvider>
  );
}
