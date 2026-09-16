import OrderCard from "../../components/OrderCard";
import Pagination from "../../components/Pagination";
import { formatCurrency } from "../../lib/format";

export type OrderStatus = "pendente" | "em-preparo" | "pronto" | "cancelado";

export interface OrderDetailItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  table: string;
  status: OrderStatus;
  items: OrderDetailItem[];
  receivedAt: string;
}

interface PedidosGridProps {
  pageItems: Order[];
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

function itemsSummary(items: OrderDetailItem[]) {
  return items.map((item) => `${item.qty}x ${item.name}`).join(", ");
}

function itemsCount(items: OrderDetailItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function orderTotal(items: OrderDetailItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

export default function PedidosGrid({
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  onOrderClick,
  statusConfig,
  gridRef,
}: PedidosGridProps) {
  if (pageItems.length === 0) {
    return (
      <p className="text-body-md text-(--color-text-secondary)">
        Nenhum pedido encontrado para este filtro.
      </p>
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
            itemsCount={itemsCount(order.items)}
            itemsSummary={itemsSummary(order.items)}
            total={formatCurrency(orderTotal(order.items))}
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
