"use client";

import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import MaskedInput from "./MaskedInput";
import Modal from "./Modal";
import NativeSelect from "./NativeSelect";

export interface NewProductInput {
  name: string;
  price: number;
  categoriaId: number;
}

export interface ProductCategoryOption {
  id: number;
  nome: string;
}

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  // May return a Promise (e.g. a POST/PUT /api/produtos call) — awaited
  // before closing, so a rejection keeps the modal open with the error
  // shown instead of closing as if the save had succeeded.
  onCreate?: (product: NewProductInput) => void | Promise<void>;
  initialValues?: NewProductInput;
  categories: ProductCategoryOption[];
}

export default function NewProductModal({
  isOpen,
  onClose,
  onCreate,
  initialValues,
  categories,
}: NewProductModalProps) {
  const isEditing = !!initialValues;
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [priceRaw, setPriceRaw] = useState(
    initialValues ? String(initialValues.price).replace(".", ",") : "",
  );
  const [categoriaId, setCategoriaId] = useState(
    initialValues ? String(initialValues.categoriaId) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // React's documented pattern for resetting state when a prop changes —
  // adjusted during render, not inside an effect.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setPriceRaw(initialValues ? String(initialValues.price).replace(".", ",") : "");
      setCategoriaId(initialValues ? String(initialValues.categoriaId) : "");
      setSubmitError(null);
    }
  }

  const price = parseFloat(priceRaw.replace(",", ".")) || 0;
  const isValid = name.trim().length > 0 && categoriaId !== "" && price > 0;

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onCreate?.({
        name: name.trim(),
        price,
        categoriaId: Number(categoriaId),
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao salvar produto",
      );
    } finally {
      setIsSubmitting(false);
    }
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

          <div>
            <NativeSelect
              label="Categoria"
              options={categories.map((category) => ({
                value: String(category.id),
                label: category.nome,
              }))}
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value)}
              disabled={categories.length === 0}
            />
            {categories.length === 0 && (
              <p className="mt-1.5 text-body-sm text-(--color-text-tertiary)">
                Cadastre uma categoria em Configurações antes de adicionar um
                produto.
              </p>
            )}
          </div>
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
              : "Adicionar Produto"}
        </Button>
      </div>
    </Modal>
  );
}
