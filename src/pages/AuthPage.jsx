import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { APP, AUTH_TEXT, ROUTES } from '../utils/constants.js';

/**
 * Login (/entrar) e Cadastro (/cadastro) no mesmo card (SPEC §7.4, §8.1).
 * As abas navegam entre as duas rotas; depois do sucesso, a rota "somente visitante"
 * (ProtectedRoute guestOnly) redireciona para a Visão Geral.
 */
export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const mode = pathname === ROUTES.register ? 'register' : 'login';
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Executa a ação, liga o spinner e treme o card se falhar (RN-05).
  const run = useCallback(async (action) => {
    setLoading(true);
    try {
      const result = await action();
      if (!result.ok) setShaking(true);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback(
    ({ email, password }) => run(() => login(email, password)),
    [run, login],
  );
  const handleRegister = useCallback((values) => run(() => register(values)), [run, register]);

  return (
    <div className="auth-page">
      <main className="auth-page__main">
        <h1 tabIndex={-1} className="visually-hidden">
          {mode === 'login' ? AUTH_TEXT.headingLogin : AUTH_TEXT.headingRegister}
        </h1>

        <AuthCard
          mode={mode}
          onModeChange={(next) => navigate(next === 'login' ? ROUTES.login : ROUTES.register)}
          shaking={shaking}
          onShakeEnd={() => setShaking(false)}
        >
          {mode === 'login' ? (
            <LoginForm key="login" onSubmit={handleLogin} loading={loading} />
          ) : (
            <RegisterForm key="register" onSubmit={handleRegister} loading={loading} />
          )}
        </AuthCard>
      </main>

      <footer className="auth-page__footer">{APP.authFooter}</footer>
    </div>
  );
}