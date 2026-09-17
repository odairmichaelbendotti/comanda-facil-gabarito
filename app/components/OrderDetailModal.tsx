import { LuPencil, LuFlame } from "react-icons/lu";
import { formatCurrency } from "../lib/format";
import Button from "./Button";
import Modal from "./Modal";

export interface OrderDetailItem {
  name: string;
  qty: number;
  price: number;
}

export interface OrderDetail {
  table: string;
  waiterName?: string;
  items: OrderDetailItem[];
  isInProgress: boolean;
  receivedAt: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail;
  onEditOrder?: () => void;
  onStartPrep?: () => void;
  onMarkReady?: () => void;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onEditOrder,
  onStartPrep,
  onMarkReady,
}: OrderDetailModalProps) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Pedido">
      <div className="flex flex-col gap-6">
        <div className="rounded-md bg-[var(--color-status-neutral-bg)] p-4">
          <p className="text-body-lg font-extrabold text-[color:var(--color-text-primary)]">
            {order.table}
          </p>
        </div>

        {order.waiterName && (
          <div className="flex items-center gap-1.5 text-body-sm">
            <span className="font-medium text-[color:var(--color-text-secondary)]">
              Garçom:
            </span>
            <span className="text-[color:var(--color-text-primary)]">
              {order.waiterName}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-label-sm font-bold tracking-[0.5px] text-[color:var(--color-text-tertiary)] uppercase">
            Itens do Pedido
          </p>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 text-body-md"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 font-bold text-[color:var(--color-text-brand)]">
                  {item.qty}x
                </span>
                <span className="truncate font-medium text-[color:var(--color-text-primary)]">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 font-semibold text-[color:var(--color-text-secondary)]">
                {formatCurrency(item.qty * item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-[var(--color-border-subtle)]" />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-body-md text-[color:var(--color-text-secondary)]">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-lg font-bold text-[color:var(--color-text-primary)]">
              Total Geral
            </span>
            <span className="text-h3 font-extrabold text-[color:var(--color-text-brand)]">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {onEditOrder && (
            <button
              type="button"
              onClick={onEditOrder}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-3 font-bold text-[color:var(--color-text-primary)] transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--color-bg-input)]"
            >
              <LuPencil className="size-4" />
              Editar Pedido
            </button>
          )}

          {onStartPrep && (
            <button
              type="button"
              onClick={onStartPrep}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 font-bold text-white transition-colors duration-150 motion-reduce:transition-none hover:bg-orange-600"
            >
              <LuFlame className="size-4" />
              Iniciar Preparo
            </button>
          )}

          {onMarkReady && (
            <Button className="w-full" onClick={onMarkReady}>
              Marcar como Pronto
            </Button>
          )}

          <p className="text-center text-body-sm text-[color:var(--color-text-tertiary)]">
            Pedido recebido às {order.receivedAt}
          </p>
        </div>
      </div>
    </Modal>
  );
}
