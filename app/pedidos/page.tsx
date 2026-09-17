"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import NewOrderModal, {
  MesaOption,
  NewOrderFormValues,
  ProdutoOption,
} from "../components/NewOrderModal";
import OrderDetailModal, {
  OrderDetail,
} from "../components/OrderDetailModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoute";
import { formatTime } from "../lib/format";
import { useAuthStore } from "../lib/store/auth-store";
import { canManageOrders, canPrepareOrders } from "../lib/permissions";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import PedidosHeader from "./_components/PedidosHeader";
import PedidosFilterBar from "./_components/PedidosFilterBar";
import PedidosGrid, { OrderStatus } from "./_components/PedidosGrid";

type FilterKey =
  | "todos"
  | "pendentes"
  | "em-preparo"
  | "prontos"
  | "cancelados";

const FILTER_TO_STATUS: Partial<Record<FilterKey, string>> = {
  pendentes: "pendente",
  "em-preparo": "em-preparo",
  prontos: "pronto",
  cancelados: "cancelado",
};

interface Order {
  id: string;
  table: string;
  status: OrderStatus;
  itemsCount: number;
  itemsSummary: string;
  total: number;
  receivedAt: string;
}

async function fetchOrders(filter: FilterKey): Promise<Order[]> {
  const status = FILTER_TO_STATUS[filter];
  const query = status
    ? `?limit=500&status=${encodeURIComponent(status)}`
    : "?limit=500";

  const response = await fetch(`/api/pedidos${query}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro ao carregar pedidos");
  }

  return data.items.map(
    (item: {
      id: number;
      status: OrderStatus;
      mesa: { id: number; numero: number };
      totalItens: number;
      resumoItens: string;
      total: string;
      createdAt: string;
    }) => ({
      id: String(item.id),
      table: `Mesa ${item.mesa.numero}`,
      status: item.status,
      itemsCount: item.totalItens,
      itemsSummary: item.resumoItens,
      total: Number(item.total),
      receivedAt: formatTime(item.createdAt),
    }),
  );
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "neutral" | "success" | "warning" | "danger" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  "em-preparo": { label: "Em Preparo", variant: "neutral" },
  pronto: { label: "Pronto", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

export default function PedidosPage() {
  return (
    <ProtectedRoute>
      <PedidosPageContent />
    </ProtectedRoute>
  );
}

function PedidosPageContent() {
  const role = useAuthStore((state) => state.user!.role);
  const canManage = canManageOrders(role);
  const canPrepare = canPrepareOrders(role);
  const user = useAuthStore((state) => state.user);
  const plano = useAuthStore((state) => state.plano);
  const setUser = useAuthStore((state) => state.setUser);

  const [mesas, setMesas] = useState<MesaOption[]>([]);
  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");

  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<
    | (OrderDetail & {
        id: string;
        status: OrderStatus;
        mesaId: number;
        rawItens: { produtoId: number; quantidade: number }[];
      })
    | null
  >(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleFilterChange(filter: FilterKey) {
    // Reset loading/error here (a user event), not inside the fetch effect —
    // an effect body shouldn't set state synchronously outside a callback.
    setOrdersLoading(true);
    setOrdersError(null);
    setActiveFilter(filter);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/mesas?limit=500", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled || !response.ok) return;
        const data = await response.json();
        setMesas(data.items);
      })
      .catch(() => {});

    fetch("/api/produtos?limit=500&disponivel=true", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled || !response.ok) return;
        const data = await response.json();
        setProdutos(
          data.items.map(
            (item: {
              id: number;
              nome: string;
              preco: string;
              categoria: { id: number; nome: string };
            }) => ({
              id: item.id,
              nome: item.nome,
              preco: Number(item.preco),
              categoriaId: item.categoria.id,
              categoriaNome: item.categoria.nome,
            }),
          ),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchOrders(activeFilter)
      .then((items) => {
        if (!cancelled) setOrders(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setOrdersError(
            error instanceof Error ? error.message : "Erro ao carregar pedidos",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  async function openOrderDetails(orderId: string) {
    setSelectedOrderId(orderId);
    setDetailsOpen(true);
    setOrderDetail(null);
    setDetailsError(null);
    setActionError(null);
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${orderId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setDetailsError(data.error || "Erro ao carregar pedido");
        return;
      }
      setOrderDetail({
        id: String(data.id),
        status: data.status,
        mesaId: data.mesa.id,
        table: `Mesa ${data.mesa.numero}`,
        waiterName: data.garcom?.nome,
        items: data.itens.map(
          (item: {
            nomeProduto: string;
            quantidade: number;
            precoUnitario: string;
          }) => ({
            name: item.nomeProduto,
            qty: item.quantidade,
            price: Number(item.precoUnitario),
          }),
        ),
        rawItens: data.itens.map(
          (item: { produtoId: number; quantidade: number }) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          }),
        ),
        isInProgress: data.status === "em-preparo",
        receivedAt: formatTime(data.createdAt),
      });
    } catch {
      setDetailsError("Erro ao conectar com o servidor");
    } finally {
      setDetailsLoading(false);
    }
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
    setOrderDetail((current) =>
      current && current.id === orderId
        ? { ...current, status, isInProgress: status === "em-preparo" }
        : current,
    );
  }

  async function markSelectedOrderReady() {
    if (!selectedOrderId || actionPending) return;
    setActionError(null);
    setActionPending(true);
    try {
      const response = await fetch(
        `/api/pedidos/${selectedOrderId}/marcar-pronto`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao marcar pedido como pronto");
      }
      updateOrderStatus(selectedOrderId, "pronto");
      setDetailsOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Erro ao marcar pedido como pronto",
      );
    } finally {
      setActionPending(false);
    }
  }

  async function startSelectedOrderPrep() {
    if (!selectedOrderId || actionPending) return;
    setActionError(null);
    setActionPending(true);
    try {
      const response = await fetch(
        `/api/pedidos/${selectedOrderId}/iniciar-preparo`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar preparo");
      }
      updateOrderStatus(selectedOrderId, "em-preparo");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Erro ao iniciar preparo",
      );
    } finally {
      setActionPending(false);
    }
  }

  function openCancelConfirm() {
    // Closes the detail modal first, like onEditOrder already does —
    // two Modal instances open at once fight over the same document-level
    // Escape/Tab handlers (see app/components/Modal.tsx), so only one is
    // ever open here.
    setDetailsOpen(false);
    setCancelConfirmOpen(true);
  }

  async function handleConfirmCancel() {
    if (!selectedOrderId) return;
    const response = await fetch(`/api/pedidos/${selectedOrderId}/cancelar`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao cancelar pedido");
    }
    updateOrderStatus(selectedOrderId, "cancelado");
  }

  async function handleSubmitOrder(values: NewOrderFormValues) {
    const body = {
      mesaId: values.mesaId,
      itens: values.itens,
    };

    const response = editingOrderId
      ? await fetch(`/api/pedidos/${editingOrderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao salvar pedido");
    }

    // Simplest consistent way to reflect a create/edit in the list and in
    // any open detail view is to just refetch both from the server, rather
    // than hand-reconstruct the summary/detail shapes from the response.
    fetchOrders(activeFilter)
      .then(setOrders)
      .catch(() => {});

    if (editingOrderId) {
      openOrderDetails(editingOrderId);
    } else if (user && plano) {
      // A new pedido counts toward this month's quota the instant it's
      // created — GET /api/auth/sessao would confirm the same number, this
      // just avoids waiting for the next session check to move the
      // sidebar's usage bar. Editing an existing pedido doesn't add a row,
      // so it never touches pedidosUsados.
      setUser(user, { ...plano, pedidosUsados: plano.pedidosUsados + 1 });
    }
    setEditingOrderId(null);
  }

  const [pageSize, gridRef] = useResponsiveGrid({
    gap: 20,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    minColumns: 1,
    minRows: 2,
  });
  const { currentPage, totalPages, pageItems, setPage } = usePagination(
    orders,
    pageSize,
  );

  return (
    <AppShell activeHref="/pedidos">
      <PedidosHeader
        onNewOrder={
          canManage
            ? () => {
                setEditingOrderId(null);
                setNewOrderOpen(true);
              }
            : undefined
        }
      />

      <PedidosFilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <div key={activeFilter} className="flex flex-1 flex-col">
        {ordersError ? (
          <p className="text-body-md text-(--color-status-danger-text)">
            {ordersError}
          </p>
        ) : (
          <PedidosGrid
            pageItems={pageItems}
            loading={ordersLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            onOrderClick={openOrderDetails}
            statusConfig={statusConfig}
            gridRef={gridRef}
          />
        )}
      </div>

      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => {
          setNewOrderOpen(false);
          setEditingOrderId(null);
        }}
        mesas={mesas}
        produtos={produtos}
        onSubmit={handleSubmitOrder}
        initialValues={
          editingOrderId && orderDetail
            ? { mesaId: orderDetail.mesaId, itens: orderDetail.rawItens }
            : undefined
        }
      />

      <OrderDetailModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        loading={detailsLoading}
        error={detailsError}
        order={orderDetail ?? undefined}
        actionPending={actionPending}
        actionError={actionError}
        onEditOrder={
          canManage && orderDetail?.status === "pendente"
            ? () => {
                setDetailsOpen(false);
                setEditingOrderId(selectedOrderId);
                setNewOrderOpen(true);
              }
            : undefined
        }
        onStartPrep={
          canPrepare && orderDetail?.status === "pendente"
            ? startSelectedOrderPrep
            : undefined
        }
        onMarkReady={
          canPrepare && orderDetail?.status === "em-preparo"
            ? markSelectedOrderReady
            : undefined
        }
        onCancelOrder={
          canManage &&
          (orderDetail?.status === "pendente" ||
            orderDetail?.status === "em-preparo")
            ? openCancelConfirm
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Pedido?"
        description={`Tem certeza que deseja cancelar o pedido da ${orderDetail?.table}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar Pedido"
        cancelLabel="Voltar"
        isDangerous
      />
    </AppShell>
  );
}
