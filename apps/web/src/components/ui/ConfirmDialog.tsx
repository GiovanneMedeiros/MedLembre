import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-ink-500">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" size="md" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Excluindo..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
