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
  onSubmit?: (values: CategoryFormValues) => void;
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
    }
  }

  const isValid = name.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit?.({ name: name.trim(), description: description.trim() });
    onClose();
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

        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          {isEditing ? "Salvar Alterações" : "Adicionar Categoria"}
        </Button>
      </div>
    </Modal>
  );
}
