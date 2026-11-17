// ============================================================================
// validators.js — e-mail, senha, nome e campos obrigatórios.
// Convenção: validate*() devolve `null` quando válido ou a mensagem de erro.
// ============================================================================

import {
  EMAIL_REGEX,
  LIMITS,
  PASSWORD_RULES,
  PASSWORD_STRENGTH_LEVELS,
  PASSWORD_STRENGTH_SEGMENTS,
  VALIDATION,
} from './constants.js';

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------
export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function normalizeName(name = '') {
  return String(name).trim().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// E-mail
// ---------------------------------------------------------------------------
export function isValidEmail(email = '') {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function validateEmail(email = '') {
  const value = normalizeEmail(email);
  if (!value) return VALIDATION.emailRequired;
  if (!EMAIL_REGEX.test(value)) return VALIDATION.emailInvalid;
  return null;
}

// ---------------------------------------------------------------------------
// Nome (2–40 caracteres)
// ---------------------------------------------------------------------------
export function validateName(name = '') {
  const value = normalizeName(name);
  if (!value) return VALIDATION.nameRequired;
  if (value.length < LIMITS.nameMin) return VALIDATION.nameMin;
  if (value.length > LIMITS.nameMax) return VALIDATION.nameMax;
  return null;
}

// ---------------------------------------------------------------------------
// Senha
// ---------------------------------------------------------------------------
/** Checklist de requisitos: [{ id, label, passed }] na ordem dos prints. */
export function getPasswordChecks(password = '') {
  const value = String(password);
  const results = {
    length: value.length >= LIMITS.passwordMin,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
  };

  return PASSWORD_RULES.map((rule) => ({ ...rule, passed: results[rule.id] }));
}

/**
 * Força em 3 níveis (Fraca/Média/Forte) e 4 segmentos:
 * 0–1 requisitos → fraca · 2–3 → média · 4 → forte.
 */
export function getPasswordStrength(password = '') {
  const passedCount = getPasswordChecks(password).filter((c) => c.passed).length;

  let level = 'weak';
  if (passedCount === PASSWORD_STRENGTH_SEGMENTS) level = 'strong';
  else if (passedCount >= 2) level = 'medium';

  return {
    level,
    label: PASSWORD_STRENGTH_LEVELS[level].label,
    tone: PASSWORD_STRENGTH_LEVELS[level].tone,
    filledSegments: passedCount,
    totalSegments: PASSWORD_STRENGTH_SEGMENTS,
  };
}

export function isStrongPassword(password = '') {
  return getPasswordChecks(password).every((c) => c.passed);
}

/** Cadastro: exige os 4 requisitos (RN-02). */
export function validateNewPassword(password = '') {
  if (!password) return VALIDATION.passwordRequired;
  if (!isStrongPassword(password)) return VALIDATION.passwordWeak;
  return null;
}

/** Login: só exige preenchimento — a regra de força vale apenas no cadastro. */
export function validateLoginPassword(password = '') {
  return password ? null : VALIDATION.passwordRequired;
}

export function validateConfirm(password = '', confirm = '') {
  if (!confirm) return VALIDATION.confirmRequired;
  if (password !== confirm) return VALIDATION.confirmMismatch;
  return null;
}

// ---------------------------------------------------------------------------
// Campos de texto genéricos
// ---------------------------------------------------------------------------
export function validateRequiredText(value = '', { min = 1, max, requiredMessage, maxMessage } = {}) {
  const text = String(value).trim();
  if (text.length < min) return requiredMessage;
  if (typeof max === 'number' && text.length > max) return maxMessage;
  return null;
}

export function validateTaskTitle(title = '') {
  return validateRequiredText(title, {
    min: LIMITS.taskTitleMin,
    max: LIMITS.taskTitleMax,
    requiredMessage: VALIDATION.taskTitleRequired,
    maxMessage: VALIDATION.taskTitleMax,
  });
}

export function validateHabitName(name = '') {
  return validateRequiredText(name, {
    min: LIMITS.habitNameMin,
    max: LIMITS.habitNameMax,
    requiredMessage: VALIDATION.habitNameRequired,
    maxMessage: VALIDATION.habitNameMax,
  });
}

export function validateHabitDays(days = []) {
  return Array.isArray(days) && days.length >= 1 ? null : VALIDATION.habitDaysRequired;
}

export function validateHabitGoal(goal) {
  const value = Number(goal);
  const ok =
    Number.isInteger(value) && value >= LIMITS.habitGoalMin && value <= LIMITS.habitGoalMax;
  return ok ? null : VALIDATION.habitGoalInvalid;
}

export function validateNoteTitle(title = '') {
  return validateRequiredText(title, {
    min: LIMITS.noteTitleMin,
    max: LIMITS.noteTitleMax,
    requiredMessage: VALIDATION.noteTitleRequired,
    maxMessage: VALIDATION.noteTitleMax,
  });
}

// ---------------------------------------------------------------------------
// Formulários completos → { valid, errors }
// ---------------------------------------------------------------------------
function collectErrors(errors) {
  const filtered = Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
  return { valid: Object.keys(filtered).length === 0, errors: filtered };
}

export function validateLoginForm({ email, password } = {}) {
  return collectErrors({
    email: validateEmail(email),
    password: validateLoginPassword(password),
  });
}

export function validateRegisterForm({ name, email, password, confirm } = {}) {
  return collectErrors({
    name: validateName(name),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirm: validateConfirm(password, confirm),
  });
}

export function validateTaskForm({ title } = {}) {
  return collectErrors({ title: validateTaskTitle(title) });
}

export function validateHabitForm({ name, days, goal } = {}) {
  return collectErrors({
    name: validateHabitName(name),
    days: validateHabitDays(days),
    goal: validateHabitGoal(goal),
  });
}

export function validateNoteForm({ title } = {}) {
  return collectErrors({ title: validateNoteTitle(title) });
}
