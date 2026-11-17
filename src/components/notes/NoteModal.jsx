import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Button from '../ui/Button.jsx';
import { LIMITS, NOTEBOOK_DEFAULT, NOTEBOOK_OPTIONS, UI_TEXT, VALIDATION } from '../../utils/constants.js';
import { textareaClass } from './NoteEditorForm.jsx';

export default function NoteModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [notebook, setNotebook] = useState(NOTEBOOK_DEFAULT); // RN-37: padrão "focus"
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setNotebook(NOTEBOOK_DEFAULT);
    setContent('');
    setError('');
  }, [open]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(VALIDATION.noteTitleRequired);
      return;
    }
    onSubmit({ title: trimmed, notebook, content });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Nota"
      description="Escolha um caderno e registre a ideia. O conteúdo aceita Markdown."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {UI_TEXT.cancel}
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleSubmit}>
            Criar Nota
          </Button>
        </div>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <Input
          id="note-title"
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
            name="note-notebook"
            options={NOTEBOOK_OPTIONS}
            value={notebook}
            onChange={setNotebook}
            columns={3}
          />
        </div>

        <div>
          <FieldLabel htmlFor="note-content">Conteúdo (opcional)</FieldLabel>
          <textarea
            id="note-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={textareaClass}
          />
        </div>
      </form>
    </Modal>
  );
}