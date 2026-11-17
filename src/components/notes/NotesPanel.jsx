import { Plus, StickyNote } from 'lucide-react';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import NoteListItem from './NoteListItem.jsx';
import { formatNoteTimestamp } from '../../utils/date.js';
import { formatNotesCount } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

function getNotePreview(content = '') {
  return String(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_~`[\]()!-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function NotesPanel({ notes, selectedId, onSelect, onCreate, className }) {
  return (
    <aside
      aria-label="Lista de notas"
      className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface', className)}
    >
      <div className="p-3">
        <Button variant="primary" icon={Plus} fullWidth onClick={onCreate}>
          Nova Nota
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="Nenhuma nota ainda"
            description="Registre ideias, aprendizados e rascunhos em Markdown."
            action={
              <Button variant="outline" size="sm" icon={Plus} onClick={onCreate}>
                Nova Nota
              </Button>
            }
          />
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <NoteListItem
                  note={note}
                  active={note.id === selectedId}
                  preview={getNotePreview(note.content)}
                  timeLabel={formatNoteTimestamp(note.updatedAt)}
                  onClick={() => onSelect(note.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-white/5 px-4 py-3 text-[11px] text-text-muted">
        {formatNotesCount(notes.length)}
      </footer>
    </aside>
  );
}