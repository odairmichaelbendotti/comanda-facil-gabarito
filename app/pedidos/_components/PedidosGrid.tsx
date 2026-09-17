import EmptyState from "../../components/EmptyState";
import OrderCard from "../../components/OrderCard";
import Pagination from "../../components/Pagination";
import { formatCurrency } from "../../lib/format";

export type OrderStatus = "pendente" | "em-preparo" | "pronto" | "cancelado";

interface Order {
  id: string;
  table: string;
  status: OrderStatus;
  itemsCount: number;
  itemsSummary: string;
  total: number;
  receivedAt: string;
}

interface PedidosGridProps {
  pageItems: Order[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderClick: (orderId: string) => void;
  statusConfig: Record<
    OrderStatus,
    { label: string; variant: "neutral" | "success" | "warning" | "danger" }
  >;
  gridRef: (node: HTMLElement | null) => void;
}

const ORDER_CARD_MIN_WIDTH = 280;
const SKELETON_CARD_COUNT = 6;

export default function PedidosGrid({
  pageItems,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onOrderClick,
  statusConfig,
  gridRef,
}: PedidosGridProps) {
  if (loading) {
    return (
      <div
        className="grid w-full gap-5"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${ORDER_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex w-full animate-pulse flex-col gap-4 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-5 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 rounded bg-(--color-status-neutral-bg)" />
              <div className="h-5 w-16 rounded-full bg-(--color-status-neutral-bg)" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-16 rounded bg-(--color-status-neutral-bg)" />
              <div className="h-3.5 w-full rounded bg-(--color-status-neutral-bg)" />
            </div>
            <div className="h-px w-full bg-(--color-border-subtle)" />
            <div className="flex items-center justify-between gap-2">
              <div className="h-6 w-20 rounded bg-(--color-status-neutral-bg)" />
              <div className="h-9 w-20 rounded-md bg-(--color-status-neutral-bg)" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pageItems.length === 0) {
    return (
      <div className="animate-fade-in-up flex flex-1 items-center justify-center">
        <EmptyState
          title="Nenhum pedido encontrado"
          subtitle="Nenhum pedido encontrado para este filtro."
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        className="animate-fade-in-up grid w-full gap-5"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${ORDER_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {pageItems.map((order) => (
          <OrderCard
            key={order.id}
            title={order.table}
            status={statusConfig[order.status].label}
            statusVariant={statusConfig[order.status].variant}
            itemsCount={order.itemsCount}
            itemsSummary={order.itemsSummary}
            total={formatCurrency(order.total)}
            onClick={() => onOrderClick(order.id)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-auto"
      />
    </>
  );
}
