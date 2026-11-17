// ============================================================================
// ids.js — ids legíveis com prefixo: usr_9f3c1a, tsk_a1b2c3, hab_m4n5o6, note_x7y8z9
// ============================================================================

export const ID_PREFIX = Object.freeze({
  user: 'usr',
  task: 'tsk',
  habit: 'hab',
  note: 'note',
});

const DEFAULT_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomChars(length) {
  const values = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 256);
  }

  let out = '';
  for (let i = 0; i < length; i += 1) out += ALPHABET[values[i] % ALPHABET.length];
  return out;
}

/**
 * Gera um id com prefixo. Se `isTaken` for informado, sorteia de novo
 * até encontrar um id livre (colisão é improvável, mas barata de evitar).
 */
export function createId(prefix, { length = DEFAULT_LENGTH, isTaken } = {}) {
  let id = `${prefix}_${randomChars(length)}`;
  let attempts = 0;

  while (typeof isTaken === 'function' && isTaken(id) && attempts < 20) {
    id = `${prefix}_${randomChars(length)}`;
    attempts += 1;
  }

  return id;
}

export const newUserId = (isTaken) => createId(ID_PREFIX.user, { isTaken });
export const newTaskId = (isTaken) => createId(ID_PREFIX.task, { isTaken });
export const newHabitId = (isTaken) => createId(ID_PREFIX.habit, { isTaken });
export const newNoteId = (isTaken) => createId(ID_PREFIX.note, { isTaken });
