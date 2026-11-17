import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Button from '../ui/Button.jsx';
import {
  LIMITS,
  TASK_CATEGORY,
  TASK_CATEGORY_OPTIONS,
  TASK_PRIORITY,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  UI_TEXT,
  VALIDATION,
} from '../../utils/constants.js';

export default function TaskModal({ open, initialStatus = TASK_STATUS.todo, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState(TASK_CATEGORY.work);
  const [priority, setPriority] = useState(TASK_PRIORITY.medium);
  const [error, setError] = useState('');

  // RN-14: abre já com a coluna inicial correspondente
  useEffect(() => {
    if (!open) return;
    setTitle('');
    setStatus(initialStatus);
    setCategory(TASK_CATEGORY.work);
    setPriority(TASK_PRIORITY.medium);
    setError('');
  }, [open, initialStatus]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(VALIDATION.taskTitleRequired); // RN-17
      return;
    }
    onSubmit({ title: trimmed, status, category, priority });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Tarefa"
      description="Escolha a coluna, a categoria e a prioridade do novo cartão."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {UI_TEXT.cancel}
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleSubmit}>
            Criar Tarefa
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
          id="task-title"
          label="Título"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value.slice(0, LIMITS.taskTitleMax));
            setError('');
          }}
          placeholder="O que precisa ser feito?"
          error={error}
          hint={`${title.length}/${LIMITS.taskTitleMax}`}
          autoComplete="off"
        />

        <div>
          <FieldLabel>Coluna</FieldLabel>
          <SegmentedControl
            name="task-status"
            options={TASK_STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            columns={3}
          />
        </div>

        <div>
          <FieldLabel>Categoria</FieldLabel>
          <SegmentedControl
            name="task-category"
            options={TASK_CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            columns={3}
          />
        </div>

        <div>
          <FieldLabel>Prioridade</FieldLabel>
          <SegmentedControl
            name="task-priority"
            options={TASK_PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
            columns={3}
          />
        </div>
      </form>
    </Modal>
  );
}