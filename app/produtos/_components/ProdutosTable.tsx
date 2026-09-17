import { LuPencil, LuTrash2 } from "react-icons/lu";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import Switch from "../../components/Switch";
import Table from "../../components/Table";
import { formatCurrency } from "../../lib/format";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoriaId: number;
  disponivel: boolean;
}

interface ProdutosTableProps {
  products: Product[];
  pageItems: Product[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDisponivel: (id: string, disponivel: boolean) => void;
  togglingIds: Set<string>;
  tableRef: (node: HTMLElement | null) => void;
}

const SKELETON_ROW_COUNT = 6;

export default function ProdutosTable({
  products,
  pageItems,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onToggleDisponivel,
  togglingIds,
  tableRef,
}: ProdutosTableProps) {
  if (loading) {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-sm border border-(--color-border-subtle) bg-(--color-bg-surface)">
        <div className="flex w-full items-center gap-3 bg-(--color-bg-surface-elevated) px-4 py-3">
          {["Nome", "Preço", "Categoria", "Disponível", "Ações"].map((label) => (
            <div key={label} className="min-w-35 flex-1 text-body-sm font-semibold text-(--color-text-secondary) first:flex-[2] last:flex last:justify-end">
              {label}
            </div>
          ))}
        </div>
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex w-full animate-pulse items-center gap-3 border-b border-(--color-border-subtle) px-4 py-3.5 last:border-b-0 motion-reduce:animate-none"
          >
            <div className="min-w-35 flex-[2]">
              <div className="h-4 w-2/3 rounded bg-(--color-status-neutral-bg)" />
            </div>
            <div className="min-w-35 flex-1">
              <div className="h-4 w-1/2 rounded bg-(--color-status-neutral-bg)" />
            </div>
            <div className="min-w-35 flex-1">
              <div className="h-6 w-20 rounded-full bg-(--color-status-neutral-bg)" />
            </div>
            <div className="min-w-35 flex-1">
              <div className="h-5 w-9 rounded-full bg-(--color-status-neutral-bg)" />
            </div>
            <div className="flex min-w-35 flex-1 justify-end gap-4">
              <div className="size-4 rounded bg-(--color-status-neutral-bg)" />
              <div className="size-4 rounded bg-(--color-status-neutral-bg)" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="animate-fade-in-up flex flex-1 items-center justify-center">
        <EmptyState
          title="Nenhum produto cadastrado"
          subtitle="Adicione produtos para começar a montar o cardápio."
        />
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in-up w-full flex flex-1 flex-col">
        <Table
          ref={tableRef}
          columns={[
            { key: "name", label: "Nome" },
            { key: "price", label: "Preço" },
            { key: "category", label: "Categoria" },
            { key: "disponivel", label: "Disponível" },
            { key: "actions", label: "Ações" },
          ]}
          rows={pageItems.map((product) => ({
            name: (
              <span className="font-semibold text-(--color-text-primary)">
                {product.name}
              </span>
            ),
            price: (
              <span className="font-bold text-(--color-text-brand)">
                {formatCurrency(product.price)}
              </span>
            ),
            category: <Badge>{product.category}</Badge>,
            disponivel: (
              <Switch
                checked={product.disponivel}
                onChange={(next) => onToggleDisponivel(product.id, next)}
                disabled={togglingIds.has(product.id)}
                label={`Disponibilidade de ${product.name}`}
              />
            ),
            actions: (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onEdit(product.id)}
                  aria-label={`Editar ${product.name}`}
                  className="cursor-pointer text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
                >
                  <LuPencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  aria-label={`Excluir ${product.name}`}
                  className="cursor-pointer text-(--color-status-danger-text) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-action-danger-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
                >
                  <LuTrash2 className="size-4" />
                </button>
              </div>
            ),
          }))}
        />
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
