// ============================================================================
// useUserCollection — coleção persistida POR USUÁRIO (tarefas, hábitos, notas).
//
//  - Lê de forma síncrona (sem "flash" de lista vazia) e relê ao trocar de conta.
//  - `commit(next)` grava no storage e atualiza o estado; `itemsRef` sempre tem a
//    versão mais recente, então várias ações no mesmo tick não perdem dados.
//  - Namespace desconhecido/corrompido → coleção reiniciada + toast de aviso.
//  - Sem userId (deslogado) → lista vazia e nenhuma gravação (RN-08).
// ============================================================================

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MESSAGES, TOAST_TYPE } from '../utils/constants.js';
import { VERSIONED_STATUS, readVersioned, writeVersioned } from '../utils/storage.js';
import { useToast } from './ToastContext.jsx';

function load(userId, getKey, sanitize) {
  if (!userId) return { userId: null, items: [], status: VERSIONED_STATUS.empty };

  const { data, status } = readVersioned(getKey(userId), { fallback: () => ({ items: [] }) });
  const items = sanitize(Array.isArray(data?.items) ? data.items : []);
  return { userId, items, status };
}

/**
 * @param userId   id do usuário da sessão (ou null)
 * @param getKey   (userId) => chave do storage — use uma função ESTÁVEL (storageKeys.x)
 * @param sanitize (rawItems) => itens válidos — também uma função ESTÁVEL
 */
export function useUserCollection({ userId, getKey, sanitize }) {
  const { showToast } = useToast();
  const [state, setState] = useState(() => load(userId, getKey, sanitize));
  const itemsRef = useRef(state.items);
  const notifiedRef = useRef(null);

  // Troca de conta: recarrega durante a renderização (padrão "derived state").
  if (state.userId !== userId) {
    setState(load(userId, getKey, sanitize));
  }

  useLayoutEffect(() => {
    itemsRef.current = state.items;
  }, [state]);

  // Aviso único quando o namespace estava incompatível e foi reiniciado.
  useEffect(() => {
    if (state.status !== VERSIONED_STATUS.reset || notifiedRef.current === state) return;
    notifiedRef.current = state;
    showToast(MESSAGES.storage.schemaReset, TOAST_TYPE.info);
  }, [state, showToast]);

  const commit = useCallback(
    (next) => {
      if (!userId) return;
      itemsRef.current = next;
      writeVersioned(getKey(userId), { items: next });
      setState({ userId, items: next, status: VERSIONED_STATUS.ok });
    },
    [userId, getKey],
  );

  return {
    items: state.userId === userId ? state.items : [],
    itemsRef,
    commit,
  };
}
