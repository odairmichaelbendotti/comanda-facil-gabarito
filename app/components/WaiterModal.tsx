"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import MaskedInput from "./MaskedInput";
import Modal from "./Modal";

export interface WaiterFormValues {
  name: string;
  cpf: string;
  birthDate: string;
  password: string;
}

interface WaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: WaiterFormValues) => void;
  initialValues?: Omit<WaiterFormValues, "password">;
}

export default function WaiterModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: WaiterModalProps) {
  const isEditing = !!initialValues;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [cpf, setCpf] = useState(initialValues?.cpf ?? "");
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate ?? "");
  const [password, setPassword] = useState("");

  // React's documented pattern for resetting state when a prop changes —
  // adjusted during render, not inside an effect.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setCpf(initialValues?.cpf ?? "");
      setBirthDate(initialValues?.birthDate ?? "");
      setPassword("");
    }
  }

  const isValid =
    name.trim().length > 0 &&
    cpf.length === 11 &&
    birthDate.length === 8 &&
    (isEditing || password.trim().length > 0);

  function handleSubmit() {
    if (!isValid) return;
    onSubmit?.({ name: name.trim(), cpf, birthDate, password });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Garçom" : "Novo Garçom"}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Nome Completo"
            placeholder="Digite o nome completo..."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <MaskedInput
            key={`cpf-${isOpen}`}
            type="cpf"
            label="CPF"
            defaultValue={cpf}
            onValueChange={setCpf}
          />

          <MaskedInput
            key={`birth-date-${isOpen}`}
            type="date"
            label="Data de Nascimento"
            defaultValue={birthDate}
            onValueChange={setBirthDate}
          />

          <Input
            label="Senha"
            type="password"
            placeholder={
              isEditing ? "Deixe em branco para manter a atual" : "••••••••••"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          {isEditing ? "Salvar Alterações" : "Adicionar Garçom"}
        </Button>
      </div>
    </Modal>
  );
}
