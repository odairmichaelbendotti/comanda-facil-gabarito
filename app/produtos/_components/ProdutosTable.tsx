import { LuPencil, LuTrash2 } from "react-icons/lu";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";
import { formatCurrency } from "../../lib/format";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ProdutosTableProps {
  products: Product[];
  pageItems: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  tableRef: (node: HTMLElement | null) => void;
}

export default function ProdutosTable({
  products,
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  tableRef,
}: ProdutosTableProps) {
  if (products.length === 0) {
    return (
      <div className="animate-fade-in-up">
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
