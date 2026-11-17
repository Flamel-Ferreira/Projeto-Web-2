import { useState } from 'react';
import { Flame, Plus } from 'lucide-react';
import { useHabits } from '../context/HabitsContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ConsistencyBar from '../components/habits/ConsistencyBar.jsx';
import HabitTable from '../components/habits/HabitTable.jsx';
import HabitModal from '../components/habits/HabitModal.jsx';

export default function HabitsPage() {
  const {
    habits,
    weekDates,
    todayKey,
    dailyConsistency,
    streakOf,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleDay,
  } = useHabits();

  const [modal, setModal] = useState({ open: false, habit: null });
  const [habitToDelete, setHabitToDelete] = useState(null);

  const openCreate = () => setModal({ open: true, habit: null });
  const openEdit = (habit) => setModal({ open: true, habit });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // O toast de sucesso é emitido pelo HabitsContext (fonte única das mutações).
  const handleSubmit = (values) => {
    if (modal.habit) {
      updateHabit(modal.habit.id, values);
    } else {
      addHabit(values);
    }
    closeModal();
  };

  const confirmDelete = () => {
    deleteHabit(habitToDelete.id);
    setHabitToDelete(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageHeader
        eyebrow="Hábitos"
        title="Meus Hábitos"
        subtitle="Acompanhamento de consistência semanal"
        action={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Novo Hábito
          </Button>
        }
      />

      <ConsistencyBar
        percent={dailyConsistency.percent}
        completed={dailyConsistency.completed}
        total={dailyConsistency.total}
      />

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface py-10">
          <EmptyState
            icon={Flame}
            title="Você ainda não criou hábitos"
            description="Crie seu primeiro hábito para acompanhar a sequência e a consistência diária."
            action={
              <Button variant="primary" icon={Plus} onClick={openCreate}>
                Novo Hábito
              </Button>
            }
          />
        </div>
      ) : (
        <HabitTable
          habits={habits}
          weekDates={weekDates}
          todayKey={todayKey}
          streakOf={streakOf}
          onToggle={toggleDay}
          onEdit={openEdit}
          onDelete={setHabitToDelete}
        />
      )}

      <HabitModal open={modal.open} habit={modal.habit} onClose={closeModal} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={habitToDelete !== null}
        title="Excluir hábito?"
        description={`"${habitToDelete?.name ?? ''}" e todo o seu histórico serão removidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setHabitToDelete(null)}
      />
    </section>
  );
}