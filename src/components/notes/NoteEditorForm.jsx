import { useState } from 'react';
import { Save } from 'lucide-react';
import Input from '../ui/Input.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Button from '../ui/Button.jsx';
import { LIMITS, NOTEBOOK_OPTIONS, UI_TEXT, VALIDATION } from '../../utils/constants.js';
import { cn } from '../../utils/cn.js';

export const textareaClass = cn(
  'w-full resize-y rounded-[10px] border border-[#26262A] bg-[#0F0F10] px-4 py-3 font-mono text-[13px] leading-relaxed text-text',
  'placeholder:text-text-muted outline-none transition-colors',
  'focus:border-primary focus:ring-2 focus:ring-primary/40',
);

export default function NoteEditorForm({ note, onSave, onCancel, className }) {
  const [title, setTitle] = useState(note.title);
  const [notebook, setNotebook] = useState(note.notebook);
  const [content, setContent] = useState(note.content);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(VALIDATION.noteTitleRequired); // RN-37
      return;
    }
    onSave({ title: trimmed, notebook, content });
  };

  return (
    <section
      aria-label="Editar nota"
      className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface', className)}
    >
      <form
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        noValidate
      >
        <Input
          id="note-edit-title"
          label="Título"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value.slice(0, LIMITS.noteTitleMax));
            setError('');
          }}
          error={error}
          hint={`${title.length}/${LIMITS.noteTitleMax}`}
          autoComplete="off"
        />

        <div>
          <FieldLabel>Caderno</FieldLabel>
          <SegmentedControl
            name="note-edit-notebook"
            options={NOTEBOOK_OPTIONS}
            value={notebook}
            onChange={setNotebook}
            columns={3}
          />
        </div>

        <div>
          <FieldLabel htmlFor="note-edit-content">Conteúdo</FieldLabel>
          <textarea
            id="note-edit-content"
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva em Markdown…"
            className={textareaClass}
          />
        </div>
      </form>

      <footer className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-3 sm:px-8">
        <Button variant="ghost" onClick={onCancel}>
          {UI_TEXT.cancel}
        </Button>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Salvar
        </Button>
      </footer>
    </section>
  );
}