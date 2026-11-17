// ============================================================================
// cn.js — concatena nomes de classes, ignorando valores falsos.
// Aceita strings, arrays (aninhados) e objetos { classe: condição }.
//   cn('btn', isActive && 'btn-active', { 'btn-lg': large }, ['a', ['b']])
// ============================================================================

export function cn(...args) {
  const classes = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const nested = cn(...arg);
      if (nested) classes.push(nested);
    } else if (typeof arg === 'object') {
      for (const [name, enabled] of Object.entries(arg)) {
        if (enabled) classes.push(name);
      }
    }
  }

  return classes.join(' ');
}

export default cn;
