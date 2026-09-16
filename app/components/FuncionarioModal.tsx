"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import MaskedInput from "./MaskedInput";
import Modal from "./Modal";

export interface FuncionarioFormValues {
  name: string;
  cpf: string;
  birthDate: string;
  role: "garcom" | "cozinha";
  password: string;
}

interface FuncionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: FuncionarioFormValues) => void;
  initialValues?: Omit<FuncionarioFormValues, "password">;
}

export default function FuncionarioModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: FuncionarioModalProps) {
  const isEditing = !!initialValues;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [cpf, setCpf] = useState(initialValues?.cpf ?? "");
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "garcom");
  const [password, setPassword] = useState("");

  // React's documented pattern for resetting state when a prop changes —
  // adjusted during render, not inside an effect.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setCpf(initialValues?.cpf ?? "");
      setBirthDate(initialValues?.birthDate ?? "");
      setRole(initialValues?.role ?? "garcom");
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
    onSubmit?.({ name: name.trim(), cpf, birthDate, role, password });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Funcionário" : "Novo Funcionário"}
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setRole("garcom")}
            className={`flex-1 cursor-pointer rounded-lg px-5 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
              role === "garcom"
                ? "bg-(--color-brand-primary) text-white"
                : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
            }`}
          >
            Garçom
          </button>
          <button
            type="button"
            onClick={() => setRole("cozinha")}
            className={`flex-1 cursor-pointer rounded-lg px-5 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
              role === "cozinha"
                ? "bg-(--color-brand-primary) text-white"
                : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
            }`}
          >
            Cozinha
          </button>
        </div>

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
          {isEditing ? "Salvar Alterações" : "Adicionar Funcionário"}
        </Button>
      </div>
    </Modal>
  );
}
