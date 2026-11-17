import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import MarkdownView from './MarkdownView.jsx';
import { NOTEBOOK_META, formatCount, formatNoteMeta } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

export default function NoteReader({ note, wordCount, updatedLabel, onEdit, onDelete, onBack, className }) {
  const shell = cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface', className);

  if (!note) {
    return (
      <section className={shell}>
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={FileText}
            title="Selecione uma nota"
            description="Escolha uma nota na lista ou crie uma nova para começar."
          />
        </div>
      </section>
    );
  }

  const notebookFullLabel = NOTEBOOK_META[note.notebook]?.fullLabel ?? '';
  const wordsLabel = formatCount(wordCount, 'palavra', 'palavras');

  return (
    <section className={shell} aria-label={`Nota: ${note.title}`}>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
        <div className="mb-4 flex items-center gap-2">
          {onBack && (
            <span className="min-[900px]:hidden">
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
                Voltar
              </Button>
            </span>
          )}
          <Button variant="ghost" size="sm" icon={Pencil} onClick={onEdit}>
            Editar
          </Button>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
          Caderno / {notebookFullLabel}
        </p>
        <h2 className="mt-3 break-words text-4xl font-light tracking-tight text-text sm:text-[44px] sm:leading-[1.1]">
          {note.title}
        </h2>
        <p className="mb-8 mt-3 text-xs text-text-muted">{formatNoteMeta(updatedLabel, wordsLabel)}</p>

        {note.content.trim() ? (
          <MarkdownView content={note.content} />
        ) : (
          <p className="text-sm italic text-text-muted">Esta nota está em branco. Use “Editar” para escrever.</p>
        )}
      </div>

      {/* RN-35: área fixa de exclusão, sempre visível */}
      <footer className="border-t border-white/5 px-6 py-3 sm:px-8">
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-2 rounded-md py-1 text-xs font-semibold text-danger outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-danger/60"
        >
          <Trash2 size={14} aria-hidden="true" />
          Excluir nota
        </button>
      </footer>
    </section>
  );
}