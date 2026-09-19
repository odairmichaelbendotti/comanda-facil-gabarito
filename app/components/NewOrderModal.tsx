"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "../lib/format";
import AccordionHeader from "./AccordionHeader";
import Button from "./Button";
import Modal from "./Modal";
import NativeSelect from "./NativeSelect";
import QuantityStepper from "./QuantityStepper";

export interface MesaOption {
  id: number;
  numero: number;
}

export interface ProdutoOption {
  id: number;
  nome: string;
  preco: number;
  categoriaId: number;
  categoriaNome: string;
}

export interface NewOrderFormValues {
  mesaId: number;
  itens: { produtoId: number; quantidade: number }[];
}

export interface NewOrderInitialValues {
  mesaId: number;
  itens: { produtoId: number; quantidade: number }[];
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesas: MesaOption[];
  produtos: ProdutoOption[];
  onSubmit?: (values: NewOrderFormValues) => void | Promise<void>;
  initialValues?: NewOrderInitialValues;
}

export default function NewOrderModal({
  isOpen,
  onClose,
  mesas,
  produtos,
  onSubmit,
  initialValues,
}: NewOrderModalProps) {
  const isEditing = !!initialValues;

  const menu = useMemo(() => {
    const categorias = new Map<
      number,
      { key: string; label: string; items: ProdutoOption[] }
    >();
    for (const produto of produtos) {
      const existing = categorias.get(produto.categoriaId);
      if (existing) {
        existing.items.push(produto);
      } else {
        categorias.set(produto.categoriaId, {
          key: String(produto.categoriaId),
          label: produto.categoriaNome,
          items: [produto],
        });
      }
    }
    return Array.from(categorias.values());
  }, [produtos]);

  const [wasOpen, setWasOpen] = useState(isOpen);
  const [mesa, setMesa] = useState(
    initialValues ? String(initialValues.mesaId) : "",
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialValues
      ? Object.fromEntries(
          initialValues.itens.map((item) => [
            String(item.produtoId),
            item.quantidade,
          ]),
        )
      : {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // React's documented pattern for resetting state when a prop changes —
  // adjusted during render, not inside an effect.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setMesa(
        initialValues
          ? String(initialValues.mesaId)
          : mesas[0]
            ? String(mesas[0].id)
            : "",
      );
      setQuantities(
        initialValues
          ? Object.fromEntries(
              initialValues.itens.map((item) => [
                String(item.produtoId),
                item.quantidade,
              ]),
            )
          : {},
      );
      setSubmitError(null);
    }
  }

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = produtos.reduce(
    (sum, produto) => sum + (quantities[String(produto.id)] ?? 0) * produto.preco,
    0,
  );

  function updateQuantity(produtoKey: string, delta: number) {
    setQuantities((current) => ({
      ...current,
      [produtoKey]: Math.max(0, (current[produtoKey] ?? 0) + delta),
    }));
  }

  const isValid = mesa !== "" && totalItems > 0;

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const itens = Object.entries(quantities)
        .filter(([, quantidade]) => quantidade > 0)
        .map(([produtoId, quantidade]) => ({
          produtoId: Number(produtoId),
          quantidade,
        }));
      await onSubmit?.({ mesaId: Number(mesa), itens });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao salvar pedido",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const mesaOptions = mesas.map((mesaOption) => ({
    value: String(mesaOption.id),
    label: `Mesa ${mesaOption.numero}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Pedido" : "Novo Pedido"}
    >
      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-[var(--color-border-subtle)]" />

        <NativeSelect
          label="Selecionar Mesa"
          value={mesa}
          onChange={(event) => setMesa(event.target.value)}
          options={mesaOptions}
          disabled={mesas.length === 0}
        />
        {mesas.length === 0 && (
          <p className="-mt-2 text-body-sm text-[color:var(--color-text-tertiary)]">
            Cadastre uma mesa antes de lançar um pedido.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <p className="text-label-sm font-semibold text-[color:var(--color-text-secondary)]">
            Itens do Cardápio
          </p>
          <div className="flex flex-col gap-1.5">
            {menu.map((category) => {
              const isExpanded = expandedCategory === category.key;
              return (
                <div key={category.key} className="flex flex-col gap-1">
                  <AccordionHeader
                    title={category.label}
                    itemCount={category.items.length}
                    expanded={isExpanded}
                    onToggle={() =>
                      setExpandedCategory(isExpanded ? null : category.key)
                    }
                  />
                  <div
                    inert={!isExpanded}
                    className={`grid transition-[grid-template-rows] duration-150 motion-reduce:transition-none ${
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-0.5 rounded-md border border-(--color-border-subtle) bg-(--color-bg-canvas) p-1.5">
                        {category.items.map((item) => {
                          const itemKey = String(item.id);
                          const selected = (quantities[itemKey] ?? 0) > 0;
                          return (
                            <div
                              key={itemKey}
                              className={`flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 transition-colors duration-150 motion-reduce:transition-none ${
                                selected
                                  ? "bg-(--color-status-neutral-bg)"
                                  : "hover:bg-(--color-bg-input)"
                              }`}
                            >
                              <p className="min-w-0 flex-1 truncate text-body-md text-(--color-text-primary)">
                                {item.nome}
                              </p>
                              <div className="flex shrink-0 items-center gap-5">
                                <p className="text-body-md font-semibold text-(--color-text-secondary)">
                                  {formatCurrency(item.preco)}
                                </p>
                                <QuantityStepper
                                  value={quantities[itemKey] ?? 0}
                                  onDecrease={() => updateQuantity(itemKey, -1)}
                                  onIncrease={() => updateQuantity(itemKey, 1)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-status-neutral-bg)] p-4">
          <p className="text-body-md font-semibold text-[color:var(--color-text-secondary)]">
            {totalItems} {totalItems === 1 ? "item selecionado" : "itens selecionados"}
          </p>
          <p className="text-body-md text-[color:var(--color-text-tertiary)]">
            Total:{" "}
            <span className="text-body-lg font-extrabold text-[color:var(--color-text-brand)]">
              {formatCurrency(totalPrice)}
            </span>
          </p>
        </div>

        {submitError && (
          <p className="text-body-sm text-[color:var(--color-status-danger-text)]">
            {submitError}
          </p>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar Alterações"
              : "Criar Pedido"}
        </Button>
      </div>
    </Modal>
  );
}
