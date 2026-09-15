import { LuPencil, LuTrash2 } from "react-icons/lu";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";

interface Waiter {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  birthDate: string;
  active: boolean;
}

interface GarconsTableProps {
  waiters: Waiter[];
  pageItems: Waiter[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  tableRef: (node: HTMLElement | null) => void;
}

export default function GarconsTable({
  waiters,
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  tableRef,
}: GarconsTableProps) {
  if (waiters.length === 0) {
    return (
      <EmptyState
        title="Nenhum garçom cadastrado"
        subtitle="Adicione garçons para organizar o atendimento."
      />
    );
  }

  return (
    <>
      <div className="animate-fade-in-up w-full flex flex-1 flex-col">
        <Table
          ref={tableRef}
          columns={[
            { key: "name", label: "Nome" },
            { key: "phone", label: "Telefone" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Ações" },
          ]}
          rows={pageItems.map((waiter) => ({
            name: (
              <span className="font-semibold text-(--color-text-primary)">
                {waiter.name}
              </span>
            ),
            phone: waiter.phone,
            status: (
              <Badge variant={waiter.active ? "success" : "neutral"}>
                {waiter.active ? "Ativo" : "Inativo"}
              </Badge>
            ),
            actions: (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onEdit(waiter.id)}
                  aria-label={`Editar ${waiter.name}`}
                  className="cursor-pointer text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
                >
                  <LuPencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(waiter.id)}
                  aria-label={`Excluir ${waiter.name}`}
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
