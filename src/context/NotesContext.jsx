// ============================================================================
// NotesContext — notas do usuário da sessão (SPEC §4.6, §5.4).
//
//  - `notes` ordenadas por `updatedAt` desc (RN-31).
//  - A seleção é derivada: sem escolha válida, vale a primeira nota da lista —
//    assim, ao excluir a selecionada, a primeira restante assume (RN-34).
//    Sem notas, `selectedNote` é null e o painel mostra "Selecione uma nota".
//  - `content` é Markdown puro e pode ser vazio; nunca é "trimado".
//  - Confirmação de exclusão fica na UI (ConfirmDialog).
// ============================================================================

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LIMITS, MESSAGES, NOTEBOOK, NOTEBOOK_DEFAULT, TOAST_TYPE } from '../utils/constants.js';
import { nowIso } from '../utils/date.js';
import { newNoteId } from '../utils/ids.js';
import { countWords } from '../utils/markdown.js';
import { storageKeys } from '../utils/storage.js';
import { validateNoteTitle } from '../utils/validators.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useUserCollection } from './useUserCollection.js';

const NotesContext = createContext(null);

const NOTEBOOK_VALUES = Object.values(NOTEBOOK);

// ---------------------------------------------------------------------------
// Lógica pura (exportada para teste)
// ---------------------------------------------------------------------------
/** RN-31: mais recentemente editadas primeiro. */
export function sortNotes(a, b) {
  return (
    String(b.updatedAt).localeCompare(String(a.updatedAt)) ||
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

export function sanitizeNotes(raw) {
  const seen = new Set();

  return raw
    .filter(
      (note) =>
        note !== null &&
        typeof note === 'object' &&
        typeof note.id === 'string' &&
        typeof note.title === 'string' &&
        note.title.trim() !== '' &&
        !seen.has(note.id) &&
        seen.add(note.id),
    )
    .map((note) => {
      const createdAt = typeof note.createdAt === 'string' ? note.createdAt : nowIso();

      return {
        id: note.id,
        title: note.title.trim().slice(0, LIMITS.noteTitleMax),
        notebook: NOTEBOOK_VALUES.includes(note.notebook) ? note.notebook : NOTEBOOK_DEFAULT,
        content: typeof note.content === 'string' ? note.content : '',
        createdAt,
        updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : createdAt,
      };
    });
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function NotesProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.userId ?? null;

  const { items, itemsRef, commit } = useUserCollection({
    userId,
    getKey: storageKeys.notes,
    sanitize: sanitizeNotes,
  });

  // A seleção pertence a um usuário: ao trocar de conta ela deixa de valer.
  const [selection, setSelection] = useState({ userId: null, id: null });

  const notes = useMemo(() => [...items].sort(sortNotes), [items]);

  const selectedNote = useMemo(() => {
    const selectedId = selection.userId === userId ? selection.id : null;
    return notes.find((note) => note.id === selectedId) ?? notes[0] ?? null;
  }, [notes, selection, userId]);

  const selectNote = useCallback(
    (id) => setSelection({ userId, id: id ?? null }),
    [userId],
  );

  const addNote = useCallback(
    (input = {}) => {
      const title = String(input.title ?? '').trim();
      if (validateNoteTitle(title)) return null;

      const current = itemsRef.current;
      const now = nowIso();
      const takenIds = new Set(current.map((note) => note.id));
      const note = {
        id: newNoteId((id) => takenIds.has(id)),
        title,
        notebook: NOTEBOOK_VALUES.includes(input.notebook) ? input.notebook : NOTEBOOK_DEFAULT,
        content: typeof input.content === 'string' ? input.content : '',
        createdAt: now,
        updatedAt: now,
      };

      commit([...current, note]);
      setSelection({ userId, id: note.id }); // RN-34: a nova nota já vem selecionada
      showToast(MESSAGES.notes.created, TOAST_TYPE.success);
      return note;
    },
    [commit, itemsRef, showToast, userId],
  );

  const updateNote = useCallback(
    (id, patch = {}) => {
      const current = itemsRef.current;
      const note = current.find((candidate) => candidate.id === id);
      if (!note) return;

      const next = { ...note };

      if (patch.title !== undefined) {
        const title = String(patch.title).trim();
        if (validateNoteTitle(title)) return;
        next.title = title;
      }
      if (NOTEBOOK_VALUES.includes(patch.notebook)) next.notebook = patch.notebook;
      if (typeof patch.content === 'string') next.content = patch.content;
      next.updatedAt = nowIso(); // RN-39: salvar atualiza updatedAt e reordena a lista

      commit(current.map((candidate) => (candidate.id === id ? next : candidate)));
      showToast(MESSAGES.notes.saved, TOAST_TYPE.success);
    },
    [commit, itemsRef, showToast],
  );

  const deleteNote = useCallback(
    (id) => {
      const current = itemsRef.current;
      if (!current.some((note) => note.id === id)) return;

      commit(current.filter((note) => note.id !== id));
      // Se era a selecionada, `selectedNote` cai na primeira restante (ou null).
      setSelection((previous) =>
        previous.id === id ? { userId: previous.userId, id: null } : previous,
      );
      showToast(MESSAGES.notes.deleted, TOAST_TYPE.success);
    },
    [commit, itemsRef, showToast],
  );

  const wordCountOf = useCallback((note) => countWords(note?.content ?? ''), []);

  const value = useMemo(
    () => ({ notes, selectedNote, selectNote, addNote, updateNote, deleteNote, wordCountOf }),
    [notes, selectedNote, selectNote, addNote, updateNote, deleteNote, wordCountOf],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes deve ser usado dentro de <NotesProvider>.');
  return context;
}
