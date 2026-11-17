// ============================================================================
// ProtectedRoute — guarda de rota por sessão (RN-09, CA-29).
//   <ProtectedRoute>              sem sessão → /entrar
//   <ProtectedRoute guestOnly>    com sessão → / (telas de login e cadastro)
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/constants.js';

export default function ProtectedRoute({ children, guestOnly = false }) {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) return null;

  if (guestOnly) {
    return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : children;
  }

  return isAuthenticated ? children : <Navigate to={ROUTES.login} replace />;
}
