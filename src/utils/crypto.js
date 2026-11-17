// ============================================================================
// crypto.js — SHA-256 + salt aleatório por usuário (Web Crypto API).
// Formato armazenado:  sha256$<saltHex>$<digestHex>
//   digest = SHA-256(salt + ":" + senha)
// A senha em texto puro NUNCA é gravada (RN-03, CA-03).
// ============================================================================

const SCHEME = 'sha256';
const SALT_BYTES = 16;

export class CryptoUnavailableError extends Error {
  constructor() {
    super('Web Crypto API indisponível neste contexto (use HTTPS ou localhost).');
    this.name = 'CryptoUnavailableError';
  }
}

function getCrypto() {
  const api = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!api || !api.subtle || typeof api.getRandomValues !== 'function') {
    throw new CryptoUnavailableError();
  }
  return api;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Salt aleatório de 16 bytes em hexadecimal (32 caracteres). */
export function generateSalt(bytes = SALT_BYTES) {
  const api = getCrypto();
  return bytesToHex(api.getRandomValues(new Uint8Array(bytes)));
}

/** SHA-256 de um texto, em hexadecimal minúsculo. */
export async function sha256Hex(text) {
  const api = getCrypto();
  const data = new TextEncoder().encode(String(text));
  const digest = await api.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

/** Gera o valor a gravar em `User.password`. */
export async function hashPassword(password, salt = generateSalt()) {
  const digest = await sha256Hex(`${salt}:${password}`);
  return `${SCHEME}$${salt}$${digest}`;
}

/** Confere se um texto tem o formato `sha256$salt$digest`. */
export function isHashedPassword(stored) {
  return parseStoredPassword(stored) !== null;
}

function parseStoredPassword(stored) {
  if (typeof stored !== 'string') return null;
  const parts = stored.split('$');
  if (parts.length !== 3) return null;

  const [scheme, salt, digest] = parts;
  if (scheme !== SCHEME) return null;
  if (!/^[0-9a-f]+$/.test(salt) || !/^[0-9a-f]{64}$/.test(digest)) return null;

  return { salt, digest };
}

// Comparação em tempo constante (evita vazar por onde as strings divergem).
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifica a senha digitada contra o valor armazenado. */
export async function verifyPassword(password, stored) {
  const parsed = parseStoredPassword(stored);
  if (!parsed) return false;

  const candidate = await sha256Hex(`${parsed.salt}:${password}`);
  return safeEqual(candidate, parsed.digest);
}
