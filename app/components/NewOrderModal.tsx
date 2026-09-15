"use client";

import { useState } from "react";
import { formatCurrency } from "../lib/format";
import AccordionHeader from "./AccordionHeader";
import Button from "./Button";
import Modal from "./Modal";
import NativeSelect from "./NativeSelect";
import QuantityStepper from "./QuantityStepper";

interface MenuItem {
  key: string;
  name: string;
  price: number;
}

interface MenuCategory {
  key: string;
  label: string;
  items: MenuItem[];
}

const mesaOptions = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: `Mesa ${index + 1}`,
}));

const menu: MenuCategory[] = [
  {
    key: "bebidas",
    label: "Bebidas",
    items: [
      { key: "coca-cola", name: "Coca-Cola Lata", price: 6 },
      { key: "guarana", name: "Guaraná Lata", price: 5 },
      { key: "suco-natural", name: "Suco Natural", price: 8 },
    ],
  },
  {
    key: "pizzas",
    label: "Pizzas",
    items: [
      { key: "calabresa", name: "Pizza Calabresa", price: 48 },
      { key: "marguerita", name: "Pizza Marguerita", price: 42 },
      { key: "frango-catupiry", name: "Pizza Frango c/ Catupiry", price: 50 },
    ],
  },
  {
    key: "sobremesas",
    label: "Sobremesas",
    items: [
      { key: "pudim", name: "Pudim", price: 10 },
      { key: "petit-gateau", name: "Petit Gateau", price: 14 },
    ],
  },
];

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewOrderModal({
  isOpen,
  onClose,
  onCreated,
}: NewOrderModalProps) {
  const [mesa, setMesa] = useState("3");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "coca-cola": 2,
    "suco-natural": 1,
  });

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = menu
    .flatMap((category) => category.items)
    .reduce((sum, item) => sum + (quantities[item.key] ?? 0) * item.price, 0);

  function updateQuantity(itemKey: string, delta: number) {
    setQuantities((current) => ({
      ...current,
      [itemKey]: Math.max(0, (current[itemKey] ?? 0) + delta),
    }));
  }

  function handleSubmit() {
    onCreated?.();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Pedido">
      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-[var(--color-border-subtle)]" />

        <NativeSelect
          label="Selecionar Mesa"
          value={mesa}
          onChange={(event) => setMesa(event.target.value)}
          options={mesaOptions}
        />

        <div className="flex flex-col gap-1">
          <p className="text-label-sm font-semibold text-[color:var(--color-text-secondary)]">
            Itens do Cardápio
          </p>
          <div className="flex flex-col gap-1">
            {menu.map((category) => {
              const isExpanded = expandedCategory === category.key;
              return (
                <div key={category.key} className="flex flex-col gap-0.5">
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
                      <div className="flex flex-col gap-0.5 px-1 pt-0.5">
                        {category.items.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 px-3 py-2.5"
                          >
                            <p className="min-w-0 flex-1 truncate text-body-md text-[color:var(--color-text-primary)]">
                              {item.name}
                            </p>
                            <div className="flex shrink-0 items-center gap-5">
                              <p className="text-body-md font-semibold text-[color:var(--color-text-secondary)]">
                                {formatCurrency(item.price)}
                              </p>
                              <QuantityStepper
                                value={quantities[item.key] ?? 0}
                                onDecrease={() => updateQuantity(item.key, -1)}
                                onIncrease={() => updateQuantity(item.key, 1)}
                              />
                            </div>
                          </div>
                        ))}
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

        <Button type="button" onClick={handleSubmit} disabled={totalItems === 0}>
          Criar Pedido
        </Button>
      </div>
    </Modal>
  );
}
