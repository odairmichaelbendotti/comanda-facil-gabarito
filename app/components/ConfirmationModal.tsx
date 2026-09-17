"use client";

import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // May return a Promise (e.g. a DELETE call) — awaited before closing, so a
  // rejection keeps the modal open with the error shown instead of closing
  // as if the action had succeeded. Existing synchronous callers (which
  // return undefined) await fine and behave exactly as before.
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "Esta ação não pode ser desfeita.",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDangerous = true,
}: ConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setError(null);
  }

  async function handleConfirm() {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar ação");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || ""}>
      <div className="flex flex-col gap-4">
        {description && (
          <p className="text-body-md text-(--color-text-secondary)">
            {description}
          </p>
        )}

        {error && (
          <p className="text-body-sm text-(--color-status-danger-text)">
            {error}
          </p>
        )}

        <div className="flex gap-2 w-full pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
