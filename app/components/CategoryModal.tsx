"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import Textarea from "./Textarea";

export interface CategoryFormValues {
  name: string;
  description: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // May return a Promise (e.g. a POST /api/categorias call) — awaited before
  // closing the modal, so a rejection keeps the modal open with the error
  // shown instead of silently discarding what the person typed.
  onSubmit?: (values: CategoryFormValues) => void | Promise<void>;
  initialValues?: CategoryFormValues;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: CategoryModalProps) {
  const isEditing = !!initialValues;
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-sync the draft with initialValues each time the modal transitions
  // from closed to open — done during render (React's documented pattern
  // for "adjusting state when a prop changes"), not in an effect, so it
  // doesn't cause an extra render pass.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setDescription(initialValues?.description ?? "");
      setSubmitError(null);
    }
  }

  const isValid = name.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit?.({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao salvar categoria",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Categoria" : "Nova Categoria"}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Sobremesas"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Textarea
            label="Descrição"
            placeholder="Descreva a categoria (opcional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {submitError && (
          <p className="-mt-2 text-body-sm text-(--color-status-danger-text)">
            {submitError}
          </p>
        )}

        <Button type="button" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar Alterações"
              : "Adicionar Categoria"}
        </Button>
      </div>
    </Modal>
  );
}
