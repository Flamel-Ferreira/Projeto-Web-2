import { useState } from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import NotesPanel from '../components/notes/NotesPanel.jsx';
import NoteReader from '../components/notes/NoteReader.jsx';
import NoteEditorForm from '../components/notes/NoteEditorForm.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';
import { formatNoteEditedLabel } from '../utils/date.js';

export default function NotesPage() {
  const { notes, selectedNote, selectNote, addNote, updateNote, deleteNote, wordCountOf } = useNotes();

  const [createOpen, setCreateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false); // < 900px: lista OU detalhe

  const handleSelect = (id) => {
    selectNote(id);
    setIsEditing(false);
    setMobileDetail(true);
  };

  // Os toasts de sucesso são emitidos pelo NotesContext (fonte única das mutações).
  const handleCreate = ({ title, notebook, content }) => {
    const note = addNote({ title, notebook, content });
    selectNote(note.id); // RN-34: nova nota é selecionada automaticamente
    setCreateOpen(false);
    setIsEditing(false);
    setMobileDetail(true);
  };

  const handleSave = (patch) => {
    updateNote(selectedNote.id, patch); // atualiza updatedAt e reordena a lista (RN-39)
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteNote(selectedNote.id); // contexto seleciona a próxima (RN-34)
    setConfirmDeleteOpen(false);
    setIsEditing(false);
    setMobileDetail(false);
  };

  const detailVisibility = mobileDetail ? 'flex' : 'hidden min-[900px]:flex';
  const listVisibility = mobileDetail ? 'hidden min-[900px]:flex' : 'flex';

  return (
    <section className="mx-auto w-full max-w-[1180px]">
      <h1 className="sr-only" tabIndex={-1}>
        Notas
      </h1>

      <div className="grid h-[calc(100vh-8rem)] min-h-[480px] gap-5 min-[900px]:grid-cols-[340px_1fr] min-[900px]:h-[calc(100vh-160px)]">
        <NotesPanel
          notes={notes}
          selectedId={selectedNote?.id ?? null}
          onSelect={handleSelect}
          onCreate={() => setCreateOpen(true)}
          className={listVisibility}
        />

        {isEditing && selectedNote ? (
          <NoteEditorForm
            key={selectedNote.id}
            note={selectedNote}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            className={detailVisibility}
          />
        ) : (
          <NoteReader
            note={selectedNote}
            wordCount={selectedNote ? wordCountOf(selectedNote) : 0}
            updatedLabel={selectedNote ? formatNoteEditedLabel(selectedNote.updatedAt) : ''}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setConfirmDeleteOpen(true)}
            onBack={() => setMobileDetail(false)}
            className={detailVisibility}
          />
        )}
      </div>

      <NoteModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Excluir nota?"
        description={`"${selectedNote?.title ?? ''}" será removida permanentemente. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </section>
  );
}