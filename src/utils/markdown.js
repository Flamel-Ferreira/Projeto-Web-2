// ============================================================================
// markdown.js — resumo de 2 linhas e contagem de palavras (RN-32, RN-36)
// ============================================================================

import { pluralize } from './constants.js';

/** Remove a sintaxe Markdown de UMA linha, deixando só o texto legível. */
export function stripMarkdownLine(line = '') {
  return (
    String(line)
      // linhas de código cercado e regras horizontais não têm texto útil
      .replace(/^\s*(```|~~~).*$/, '')
      .replace(/^\s*([-*_])(\s*\1){2,}\s*$/, '')
      // imagens e links: mantém o texto
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // tags HTML simples
      .replace(/<\/?[a-zA-Z][^>]*>/g, '')
      // títulos, citações, marcadores de lista e checkboxes
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*>+\s?/, '')
      .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/^\s*\d+[.)]\s+/, '')
      // ênfase, riscado e código inline
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      // barras de tabela
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .replace(/\s*\|\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Resumo do card: as primeiras linhas NÃO vazias (após remover Markdown),
 * unidas por "\n". Use com `line-clamp-2 whitespace-pre-line`.
 */
export function getNoteSummary(content = '', maxLines = 2) {
  const lines = [];

  for (const rawLine of String(content).split(/\r?\n/)) {
    const clean = stripMarkdownLine(rawLine);
    if (clean) lines.push(clean);
    if (lines.length >= maxLines) break;
  }

  return lines.join('\n');
}

/** Contagem de palavras ignorando espaços extras e quebras vazias (RN-36). */
export function countWords(content = '') {
  return String(content).trim().split(/\s+/).filter(Boolean).length;
}

/** "1 palavra" / "12 palavras" */
export function formatWordCount(count = 0) {
  return `${count} ${pluralize(count, 'palavra', 'palavras')}`;
}
