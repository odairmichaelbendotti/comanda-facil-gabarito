"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import MaskedInput from "./MaskedInput";
import Modal from "./Modal";
import NativeSelect from "./NativeSelect";

const categoryOptions = [
  { value: "Bebidas", label: "Bebidas" },
  { value: "Pizzas", label: "Pizzas" },
  { value: "Pratos", label: "Pratos" },
  { value: "Sobremesas", label: "Sobremesas" },
];

export interface NewProductInput {
  name: string;
  price: number;
  category: string;
}

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (product: NewProductInput) => void;
  initialValues?: NewProductInput;
}

export default function NewProductModal({
  isOpen,
  onClose,
  onCreate,
  initialValues,
}: NewProductModalProps) {
  const isEditing = !!initialValues;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [priceRaw, setPriceRaw] = useState(
    initialValues ? String(initialValues.price).replace(".", ",") : "",
  );
  const [category, setCategory] = useState(initialValues?.category ?? "");

  // React's documented pattern for resetting state when a prop changes —
  // adjusted during render, not inside an effect.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setPriceRaw(initialValues ? String(initialValues.price).replace(".", ",") : "");
      setCategory(initialValues?.category ?? "");
    }
  }

  const price = parseFloat(priceRaw.replace(",", ".")) || 0;
  const isValid = name.trim().length > 0 && category.trim().length > 0 && price > 0;

  function handleSubmit() {
    if (!isValid) return;
    onCreate?.({ name: name.trim(), price, category: category.trim() });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Produto" : "Novo Produto"}
    >
      <div className="flex flex-col gap-6">
        <div className="h-px w-full bg-(--color-border-subtle)" />

        <div className="flex flex-col gap-4">
          <Input
            label="Nome do Produto"
            placeholder="Ex: Pizza Margherita"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <MaskedInput
            key={`price-${isOpen}`}
            type="currency"
            label="Preço (R$)"
            defaultValue={priceRaw}
            onValueChange={setPriceRaw}
          />

          <NativeSelect
            label="Categoria"
            options={categoryOptions}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>

        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          {isEditing ? "Salvar Alterações" : "Adicionar Produto"}
        </Button>
      </div>
    </Modal>
  );
}
