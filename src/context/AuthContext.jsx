// ============================================================================
// AuthContext — contas, sessão e perfil (SPEC §5.1, §6.2, §6.3, §6.8).
//
//  - Senha SEMPRE como sha256$salt$digest (RN-03); nada em claro no storage.
//  - Login inválido devolve mensagem genérica (RN-05): não revela qual campo falhou.
//  - A sessão é lida de forma síncrona na montagem, então rotas privadas não
//    "piscam" a tela de login ao recarregar (F5 preserva a rota — CA-29).
//  - `storage` entre abas sincroniza login/logout (RN-09).
// ============================================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  APP,
  MESSAGES,
  TOAST_TYPE,
  getFirstName,
} from '../utils/constants.js';
import { CryptoUnavailableError, hashPassword, verifyPassword } from '../utils/crypto.js';
import { nowIso } from '../utils/date.js';
import { newUserId } from '../utils/ids.js';
import {
  readVersioned,
  storageGet,
  storageKeys,
  storageRemove,
  storageSet,
  subscribeToStorage,
  writeVersioned,
} from '../utils/storage.js';
import {
  normalizeEmail,
  normalizeName,
  validateLoginForm,
  validateName,
  validateRegisterForm,
} from '../utils/validators.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

// Hash fictício (64 zeros): permite gastar o mesmo tempo de verificação quando o
// e-mail não existe, para não revelar contas cadastradas pelo tempo de resposta.
const DUMMY_HASH = `sha256$${'0'.repeat(32)}$${'0'.repeat(64)}`;

// ---------------------------------------------------------------------------
// Acesso ao storage (funções puras do módulo)
// ---------------------------------------------------------------------------
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readUsers() {
  const { data } = readVersioned(storageKeys.users(), { fallback: () => ({ users: [] }) });
  const users = Array.isArray(data?.users) ? data.users : [];

  return users.filter(
    (user) =>
      isObject(user) &&
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.password === 'string',
  );
}

function writeUsers(users) {
  return writeVersioned(storageKeys.users(), { users });
}

function buildProfile(user) {
  return {
    userId: user.id,
    displayName: user.name,
    plan: APP.defaultPlan,
    avatarColor: APP.defaultAvatarColor,
    createdAt: user.createdAt,
  };
}

function isValidProfile(profile, userId) {
  return isObject(profile) && profile.userId === userId && typeof profile.displayName === 'string';
}

/** Perfil salvo; se faltar ou estiver corrompido, recria a partir da conta. */
function loadProfile(userId) {
  const stored = storageGet(storageKeys.profile(userId), null);
  if (isValidProfile(stored, userId)) return stored;

  const user = readUsers().find((candidate) => candidate.id === userId);
  if (!user) return null;

  const profile = buildProfile(user);
  storageSet(storageKeys.profile(userId), profile);
  return profile;
}

function readSession() {
  const session = storageGet(storageKeys.session(), null);
  return isObject(session) && typeof session.userId === 'string' ? session : null;
}

function writeSession(user) {
  return storageSet(storageKeys.session(), {
    userId: user.id,
    email: user.email,
    createdAt: nowIso(),
  });
}

/** Perfil da sessão ativa, ou null (sessão ausente ou de conta que não existe mais). */
function resolveSessionProfile() {
  const session = readSession();
  if (!session) return null;

  const profile = loadProfile(session.userId);
  if (!profile) {
    storageRemove(storageKeys.session()); // sessão órfã
    return null;
  }
  return profile;
}

function firstError(errors = {}) {
  return Object.values(errors)[0] ?? MESSAGES.auth.unexpected;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(resolveSessionProfile);

  // Sincroniza login/logout feitos em outra aba (RN-09).
  useEffect(
    () =>
      subscribeToStorage(({ key }) => {
        if (key !== null && key !== storageKeys.session()) return;

        const next = resolveSessionProfile();
        setUser((current) => (!current && !next ? current : next));
      }),
    [],
  );

  const failWith = useCallback(
    (error) => {
      const message =
        error instanceof CryptoUnavailableError
          ? MESSAGES.auth.cryptoUnavailable
          : MESSAGES.auth.unexpected;
      showToast(message, TOAST_TYPE.error);
      return { ok: false, error: message };
    },
    [showToast],
  );

  const register = useCallback(
    async ({ name, email, password, confirm } = {}) => {
      const form = validateRegisterForm({ name, email, password, confirm });
      if (!form.valid) {
        showToast(MESSAGES.auth.registerInvalid, TOAST_TYPE.error);
        return { ok: false, error: MESSAGES.auth.registerInvalid, errors: form.errors };
      }

      const emailTaken = () => {
        showToast(MESSAGES.auth.emailTaken, TOAST_TYPE.error);
        return {
          ok: false,
          error: MESSAGES.auth.emailTaken,
          errors: { email: MESSAGES.auth.emailTaken },
        };
      };

      try {
        const normalizedEmail = normalizeEmail(email);
        if (readUsers().some((candidate) => candidate.email === normalizedEmail)) {
          return emailTaken();
        }

        const passwordHash = await hashPassword(password);

        // Relê após o await: outra aba pode ter cadastrado o mesmo e-mail nesse intervalo.
        const users = readUsers();
        if (users.some((candidate) => candidate.email === normalizedEmail)) {
          return emailTaken();
        }

        const now = nowIso();
        const takenIds = new Set(users.map((candidate) => candidate.id));
        const newUser = {
          id: newUserId((id) => takenIds.has(id)),
          email: normalizedEmail,
          name: normalizeName(name),
          password: passwordHash,
          createdAt: now,
          lastLoginAt: now,
        };

        // Conta nova nasce vazia: sem seed de tarefas, hábitos ou notas (D1).
        const profile = buildProfile(newUser);
        writeUsers([...users, newUser]);
        storageSet(storageKeys.profile(newUser.id), profile);
        writeSession(newUser); // login automático (RN-04)

        setUser(profile);
        showToast(MESSAGES.auth.registerSuccess, TOAST_TYPE.success);
        return { ok: true };
      } catch (error) {
        return failWith(error);
      }
    },
    [showToast, failWith],
  );

  const login = useCallback(
    async (email, password) => {
      const form = validateLoginForm({ email, password });
      if (!form.valid) {
        // Campos vazios/inválidos: erro inline no formulário, sem toast.
        return { ok: false, error: firstError(form.errors), errors: form.errors };
      }

      try {
        const normalizedEmail = normalizeEmail(email);
        const found = readUsers().find((candidate) => candidate.email === normalizedEmail);

        const passwordMatches = await verifyPassword(password, found ? found.password : DUMMY_HASH);
        if (!found || !passwordMatches) {
          showToast(MESSAGES.auth.invalidCredentials, TOAST_TYPE.error);
          return { ok: false, error: MESSAGES.auth.invalidCredentials, code: 'invalid_credentials' };
        }

        // Relê a lista antes de gravar para não sobrescrever cadastros de outra aba.
        writeUsers(
          readUsers().map((candidate) =>
            candidate.id === found.id ? { ...candidate, lastLoginAt: nowIso() } : candidate,
          ),
        );

        const profile = loadProfile(found.id) ?? buildProfile(found);
        writeSession(found);

        setUser(profile);
        showToast(
          MESSAGES.auth.welcomeBack(getFirstName(profile.displayName)),
          TOAST_TYPE.success,
        );
        return { ok: true };
      } catch (error) {
        return failWith(error);
      }
    },
    [showToast, failWith],
  );

  // Remove APENAS a sessão: os dados do usuário permanecem (RN-07). O Pomodoro é
  // pausado pelo PomodoroContext ao perceber a troca de usuário, e a rota
  // protegida redireciona para /entrar.
  const logout = useCallback(() => {
    storageRemove(storageKeys.session());
    setUser(null);
  }, []);

  // O nome é imutável na interface desta versão (sem tela de perfil), mas a API
  // existe e mantém Profile e User sincronizados.
  const updateProfile = useCallback(
    (patch = {}) => {
      if (!user) return { ok: false, error: MESSAGES.auth.unexpected };

      const nextProfile = { ...user };

      if (patch.displayName !== undefined) {
        const error = validateName(patch.displayName);
        if (error) return { ok: false, error };
        nextProfile.displayName = normalizeName(patch.displayName);
      }

      storageSet(storageKeys.profile(user.userId), nextProfile);
      writeUsers(
        readUsers().map((candidate) =>
          candidate.id === user.userId ? { ...candidate, name: nextProfile.displayName } : candidate,
        ),
      );

      setUser(nextProfile);
      return { ok: true };
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      // A sessão é lida de forma síncrona na montagem: nunca há "boot" pendente.
      // Mantido por contrato (SPEC §7.1) para o caso de uma leitura assíncrona futura.
      isBooting: false,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return context;
}
