"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";

interface NewMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (number: number) => void;
  suggestedNumber?: number;
}

export default function NewMesaModal({
  isOpen,
  onClose,
  onSubmit,
  suggestedNumber = 1,
}: NewMesaModalProps) {
  const [numberInput, setNumberInput] = useState("");

  const parsedNumber = parseInt(numberInput, 10);
  const isValid = numberInput.trim().length > 0 && parsedNumber > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit?.(parsedNumber);
    setNumberInput("");
    onClose();
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

        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          Adicionar Mesa
        </Button>
      </div>
    </Modal>
  );
}
