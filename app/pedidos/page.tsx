"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import NewOrderModal from "../components/NewOrderModal";
import OrderDetailModal, {
  OrderDetailItem,
} from "../components/OrderDetailModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import PedidosHeader from "./_components/PedidosHeader";
import PedidosFilterBar from "./_components/PedidosFilterBar";
import PedidosGrid, { OrderStatus } from "./_components/PedidosGrid";

type FilterKey = "todos" | "em-producao" | "entregues" | "cancelados";

interface Order {
  id: string;
  table: string;
  status: OrderStatus;
  items: OrderDetailItem[];
  receivedAt: string;
}

const initialOrders: Order[] = [
  {
    id: "56",
    table: "Mesa 56",
    status: "em-producao",
    items: [{ name: "Coca-Cola Lata", qty: 1, price: 6 }],
    receivedAt: "14:02",
  },
  {
    id: "52",
    table: "Mesa 52",
    status: "em-producao",
    items: [
      { name: "Coca-Cola Lata", qty: 1, price: 6 },
      { name: "Pizza Frango c/ Catupiry", qty: 1, price: 30 },
    ],
    receivedAt: "14:32",
  },
  {
    id: "12",
    table: "Mesa 12",
    status: "em-producao",
    items: [{ name: "Pizza Frango c/ Catupiry", qty: 1, price: 30 }],
    receivedAt: "14:41",
  },
  {
    id: "8",
    table: "Mesa 8",
    status: "em-producao",
    items: [
      { name: "Água Mineral", qty: 2, price: 6 },
      { name: "Picanha", qty: 1, price: 40 },
    ],
    receivedAt: "14:55",
  },
  {
    id: "21",
    table: "Mesa 21",
    status: "entregue",
    items: [{ name: "Pizza Marguerita", qty: 1, price: 42 }],
    receivedAt: "13:18",
  },
  {
    id: "45",
    table: "Mesa 45",
    status: "cancelado",
    items: [{ name: "Coca-Cola Lata", qty: 1, price: 6 }],
    receivedAt: "12:47",
  },
  {
    id: "3",
    table: "Mesa 3",
    status: "em-producao",
    items: [{ name: "Suco Natural", qty: 2, price: 8 }],
    receivedAt: "15:03",
  },
  {
    id: "17",
    table: "Mesa 17",
    status: "entregue",
    items: [{ name: "Pizza Calabresa", qty: 1, price: 48 }],
    receivedAt: "13:40",
  },
  {
    id: "29",
    table: "Mesa 29",
    status: "em-producao",
    items: [
      { name: "Guaraná Lata", qty: 1, price: 5 },
      { name: "Pudim", qty: 1, price: 10 },
    ],
    receivedAt: "15:12",
  },
  {
    id: "34",
    table: "Mesa 34",
    status: "entregue",
    items: [{ name: "Picanha", qty: 1, price: 40 }],
    receivedAt: "12:58",
  },
  {
    id: "9",
    table: "Mesa 9",
    status: "cancelado",
    items: [{ name: "Petit Gateau", qty: 1, price: 14 }],
    receivedAt: "12:20",
  },
  {
    id: "41",
    table: "Mesa 41",
    status: "em-producao",
    items: [{ name: "Pizza Marguerita", qty: 1, price: 42 }],
    receivedAt: "15:21",
  },
  {
    id: "18",
    table: "Mesa 18",
    status: "entregue",
    items: [
      { name: "Coca-Cola Lata", qty: 2, price: 6 },
      { name: "Pizza Calabresa", qty: 1, price: 48 },
    ],
    receivedAt: "13:05",
  },
  {
    id: "27",
    table: "Mesa 27",
    status: "em-producao",
    items: [{ name: "Água Mineral", qty: 3, price: 6 }],
    receivedAt: "15:30",
  },
];

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "neutral" | "success" | "danger" }
> = {
  "em-producao": { label: "Em produção", variant: "neutral" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

function matchesFilter(order: Order, filter: FilterKey) {
  if (filter === "todos") return true;
  if (filter === "entregues") return order.status === "entregue";
  if (filter === "cancelados") return order.status === "cancelado";
  return order.status === filter;
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0].id);

  function openOrderDetails(orderId: string) {
    setSelectedOrderId(orderId);
    setDetailsOpen(true);
  }

  function markSelectedOrderReady() {
    setOrders((current) =>
      current.map((order) =>
        order.id === selectedOrderId ? { ...order, status: "entregue" } : order,
      ),
    );
    setDetailsOpen(false);
  }

  const visibleOrders = orders.filter((order) =>
    matchesFilter(order, activeFilter),
  );
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  const [pageSize, gridRef] = useResponsiveGrid({
    gap: 20,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    minColumns: 1,
    minRows: 2,
  });
  const { currentPage, totalPages, pageItems, setPage } = usePagination(
    visibleOrders,
    pageSize,
  );

  return (
    <AppShell activeHref="/pedidos">
      <PedidosHeader onNewOrder={() => setNewOrderOpen(true)} />

      <PedidosFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div key={activeFilter} className="flex flex-1 flex-col">
        <PedidosGrid
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onOrderClick={openOrderDetails}
          statusConfig={statusConfig}
          gridRef={gridRef}
        />
      </div>

      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
      />

      <OrderDetailModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        order={{
          table: selectedOrder.table,
          items: selectedOrder.items,
          isInProgress: selectedOrder.status === "em-producao",
          receivedAt: selectedOrder.receivedAt,
        }}
        onEditOrder={() => {
          // TODO: wire up edit order functionality
          setDetailsOpen(false);
        }}
        onStartPrep={() => {
          // TODO: wire up start prep functionality
        }}
        onMarkReady={markSelectedOrderReady}
      />
    </AppShell>
  );
}
