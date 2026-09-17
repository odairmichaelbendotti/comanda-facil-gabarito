"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";

interface NewMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  // May return a Promise (e.g. a POST /api/mesas call) — awaited before
  // closing, so a rejection keeps the modal open with the error shown
  // instead of closing as if the mesa had been created.
  onSubmit?: (number: number) => void | Promise<void>;
  suggestedNumber?: number;
}

export default function NewMesaModal({
  isOpen,
  onClose,
  onSubmit,
  suggestedNumber = 1,
}: NewMesaModalProps) {
  const [numberInput, setNumberInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setNumberInput("");
      setSubmitError(null);
    }
  }

  const parsedNumber = parseInt(numberInput, 10);
  const isValid = numberInput.trim().length > 0 && parsedNumber > 0;

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit?.(parsedNumber);
      setNumberInput("");
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao adicionar mesa",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Mesa">
      <div className="flex flex-col gap-6">
        <Input
          label="Número da Mesa"
          placeholder={String(suggestedNumber)}
          inputMode="numeric"
          value={numberInput}
          onChange={(event) => setNumberInput(event.target.value.replace(/\D/g, ""))}
        />

        {submitError && (
          <p className="-mt-2 text-body-sm text-(--color-status-danger-text)">
            {submitError}
          </p>
        )}

        <Button type="button" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Salvando..." : "Adicionar Mesa"}
        </Button>
      </div>
    </Modal>
  );
}
