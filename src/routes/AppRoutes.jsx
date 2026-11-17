// ============================================================================
// AppRoutes — árvore de rotas (D8, HashRouter):
//   /entrar, /cadastro            → AuthPage (somente sem sessão)
//   /, /foco, /habitos,
//   /tarefas, /notas              → AppShell protegido (layout route com <Outlet />)
//   *                             → redireciona para /
// ============================================================================

import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import FocusPage from '../pages/FocusPage.jsx';
import HabitsPage from '../pages/HabitsPage.jsx';
import NotesPage from '../pages/NotesPage.jsx';
import OverviewPage from '../pages/OverviewPage.jsx';
import TasksPage from '../pages/TasksPage.jsx';
import { ROUTES } from '../utils/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';

// Caminhos relativos ao layout (sem a barra inicial).
const child = (path) => path.replace(/^\//, '');

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={
          <ProtectedRoute guestOnly>
            <AuthPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.register}
        element={
          <ProtectedRoute guestOnly>
            <AuthPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path={child(ROUTES.focus)} element={<FocusPage />} />
        <Route path={child(ROUTES.habits)} element={<HabitsPage />} />
        <Route path={child(ROUTES.tasks)} element={<TasksPage />} />
        <Route path={child(ROUTES.notes)} element={<NotesPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
