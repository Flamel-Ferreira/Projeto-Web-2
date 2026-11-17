import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../context/TasksContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import TaskBoard from '../components/tasks/TaskBoard.jsx';
import TaskModal from '../components/tasks/TaskModal.jsx';
import { TASK_STATUS, formatTaskSummary } from '../utils/constants.js';

export default function TasksPage() {
  const { tasks, counts, addTask, deleteTask, toggleComplete, moveTask } = useTasks();

  const [modal, setModal] = useState({ open: false, status: TASK_STATUS.todo });
  const [taskToDelete, setTaskToDelete] = useState(null);

  const openModal = (status = TASK_STATUS.todo) => setModal({ open: true, status }); // RN-14
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // O toast de sucesso é emitido pelo TasksContext (fonte única das mutações).
  const handleSubmit = (values) => {
    addTask(values);
    closeModal();
  };

  const confirmDelete = () => {
    deleteTask(taskToDelete.id); // RN-18: o contexto limpa o currentTaskId do Pomodoro
    setTaskToDelete(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageHeader
        eyebrow="Quadro simples • Organização diária"
        title="Tarefas"
        subtitle={formatTaskSummary(counts)}
        action={
          <Button variant="primary" icon={Plus} onClick={() => openModal(TASK_STATUS.todo)}>
            Nova Tarefa
          </Button>
        }
      />

      <TaskBoard
        tasks={tasks}
        onMove={moveTask}
        onAddCard={openModal}
        onToggle={toggleComplete}
        onDelete={setTaskToDelete}
      />

      <TaskModal open={modal.open} initialStatus={modal.status} onClose={closeModal} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Excluir tarefa?"
        description={`"${taskToDelete?.title ?? ''}" será removida do quadro. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </section>
  );
}