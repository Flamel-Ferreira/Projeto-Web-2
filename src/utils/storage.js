// ============================================================================
// storage.js — get/set/remove + JSON seguro + namespace por usuário.
//
// Regras (SPEC §4.1):
//  - Toda leitura passa por safeParse com fallback: JSON inválido nunca quebra o app.
//  - Chaves de dados por usuário SEMPRE incluem o userId (sem vazar entre contas).
//  - localStorage indisponível / quota excedida → modo somente memória e aviso
//    único (via handler registrado pelo ToastContext).
//  - `schemaVersion` desconhecido → migra ou reinicia SÓ aquele namespace.
// ============================================================================

import { SCHEMA_VERSION, STORAGE_NAMESPACES, STORAGE_PREFIX } from './constants.js';

// ---------------------------------------------------------------------------
// Estado interno
// ---------------------------------------------------------------------------
const memoryStore = new Map(); // chave → string JSON (espelha o formato do localStorage)
let memoryOnly = false;
let errorHandler = null;
const reported = new Set();
const pendingErrors = []; // erros ocorridos antes de existir um handler (ex.: na leitura inicial)

export const STORAGE_ERROR = Object.freeze({
  unavailable: 'unavailable',
  quota: 'quota',
});

/**
 * O ToastContext registra aqui como exibir o aviso (ex.: toast de erro).
 * Erros que aconteceram antes do registro são entregues assim que o handler existir.
 */
export function setStorageErrorHandler(handler) {
  errorHandler = typeof handler === 'function' ? handler : null;
  if (errorHandler && pendingErrors.length > 0) {
    pendingErrors.splice(0).forEach((kind) => errorHandler(kind));
  }
}

function report(kind) {
  memoryOnly = true;
  if (reported.has(kind)) return; // avisa uma única vez por tipo
  reported.add(kind);
  if (errorHandler) errorHandler(kind);
  else pendingErrors.push(kind);
}

export function isMemoryOnly() {
  return memoryOnly;
}

function getBackend() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null; // acesso negado (modo privado restrito, cookies bloqueados)
  }
}

function isQuotaError(error) {
  return (
    !!error &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  );
}

// ---------------------------------------------------------------------------
// Chaves
// ---------------------------------------------------------------------------
/** Chave global (sem usuário): users, session. */
export function buildKey(namespace) {
  return `${STORAGE_PREFIX}:${namespace}`;
}

/** Chave por usuário: exige userId para garantir o isolamento entre contas. */
export function buildUserKey(namespace, userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error(`userId é obrigatório para a chave "${namespace}".`);
  }
  return `${STORAGE_PREFIX}:${namespace}:${userId}`;
}

export const storageKeys = Object.freeze({
  users: () => buildKey(STORAGE_NAMESPACES.users),
  session: () => buildKey(STORAGE_NAMESPACES.session),
  profile: (userId) => buildUserKey(STORAGE_NAMESPACES.profile, userId),
  tasks: (userId) => buildUserKey(STORAGE_NAMESPACES.tasks, userId),
  habits: (userId) => buildUserKey(STORAGE_NAMESPACES.habits, userId),
  notes: (userId) => buildUserKey(STORAGE_NAMESPACES.notes, userId),
  pomodoro: (userId) => buildUserKey(STORAGE_NAMESPACES.pomodoro, userId),
});

// ---------------------------------------------------------------------------
// Leitura e escrita brutas
// ---------------------------------------------------------------------------
function readRaw(key) {
  // Valores que caíram para a memória (quota/indisponível) são os mais recentes.
  if (memoryStore.has(key)) return memoryStore.get(key);

  const backend = getBackend();
  if (!backend) {
    report(STORAGE_ERROR.unavailable);
    return null;
  }

  try {
    return backend.getItem(key);
  } catch {
    report(STORAGE_ERROR.unavailable);
    return null;
  }
}

function safeParse(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Lê e converte o JSON; devolve `fallback` se não existir ou estiver corrompido. */
export function storageGet(key, fallback = null) {
  return safeParse(readRaw(key), fallback);
}

/** Grava como JSON. Devolve true se foi para o localStorage, false se caiu para a memória. */
export function storageSet(key, value) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false; // valor não serializável (ciclo etc.)
  }

  const backend = getBackend();
  if (!backend) {
    memoryStore.set(key, serialized);
    report(STORAGE_ERROR.unavailable);
    return false;
  }

  try {
    backend.setItem(key, serialized);
    memoryStore.delete(key); // o localStorage voltou a ser a fonte da verdade
    return true;
  } catch (error) {
    memoryStore.set(key, serialized);
    report(isQuotaError(error) ? STORAGE_ERROR.quota : STORAGE_ERROR.unavailable);
    return false;
  }
}

export function storageRemove(key) {
  memoryStore.delete(key);
  const backend = getBackend();
  if (!backend) return;
  try {
    backend.removeItem(key);
  } catch {
    /* sem ação: a chave já saiu da memória */
  }
}

export function storageHas(key) {
  return readRaw(key) !== null;
}

// ---------------------------------------------------------------------------
// Dados versionados: { schemaVersion, ...payload }
// ---------------------------------------------------------------------------
export const VERSIONED_STATUS = Object.freeze({
  empty: 'empty', // nada salvo ainda → usa o fallback
  ok: 'ok', // versão atual
  migrated: 'migrated', // versão antiga migrada com sucesso
  reset: 'reset', // versão desconhecida/corrompida → reiniciado (avisar com toast)
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Lê um namespace versionado.
 *  - `fallback`: () => payload padrão (ex.: () => ({ items: [] })).
 *  - `migrate`: (stored) => payload | null — tenta migrar versões antigas.
 * Retorna { data, status }. Em `reset`, o chamador deve emitir o toast de aviso.
 */
export function readVersioned(
  key,
  { version = SCHEMA_VERSION, fallback = () => ({}), migrate } = {},
) {
  const raw = readRaw(key);
  if (raw === null || raw === undefined) {
    return { data: fallback(), status: VERSIONED_STATUS.empty };
  }

  const stored = safeParse(raw, undefined);
  if (!isPlainObject(stored) || typeof stored.schemaVersion !== 'number') {
    return { data: fallback(), status: VERSIONED_STATUS.reset };
  }

  const { schemaVersion, ...payload } = stored;
  if (schemaVersion === version) {
    return { data: payload, status: VERSIONED_STATUS.ok };
  }

  if (typeof migrate === 'function') {
    try {
      const migrated = migrate(stored);
      if (isPlainObject(migrated)) {
        return { data: migrated, status: VERSIONED_STATUS.migrated };
      }
    } catch {
      /* cai no reset abaixo */
    }
  }

  return { data: fallback(), status: VERSIONED_STATUS.reset };
}

/** Grava um namespace versionado: { schemaVersion, ...payload }. */
export function writeVersioned(key, payload, version = SCHEMA_VERSION) {
  return storageSet(key, { schemaVersion: version, ...payload });
}

// ---------------------------------------------------------------------------
// Sincronização entre abas (evento `storage`) — usado para logout/login (RN-09)
// ---------------------------------------------------------------------------
/**
 * Escuta mudanças feitas em OUTRAS abas. O listener recebe `{ key }`; o
 * contexto decide se relê a sessão. Retorna a função de cancelamento.
 */
export function subscribeToStorage(listener) {
  if (typeof window === 'undefined' || typeof listener !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    // event.key === null quando o storage inteiro foi limpo
    if (event.key === null || event.key.startsWith(`${STORAGE_PREFIX}:`)) {
      listener({ key: event.key });
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
