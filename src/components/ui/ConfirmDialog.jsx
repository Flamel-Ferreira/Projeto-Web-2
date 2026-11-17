import { UI_TEXT } from '../../utils/constants.js';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

/**
 * Confirmação de ações (excluir tarefa/hábito/nota, trocar de modo com o timer rodando).
 * O foco inicial fica em "Cancelar" — o caminho seguro. `destructive` pinta o botão de vermelho.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = UI_TEXT.confirm,
  cancelLabel = UI_TEXT.cancel,
  destructive = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
