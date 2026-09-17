import { LuPencil, LuTrash2 } from "react-icons/lu";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";

const roleConfig: Record<
  "garcom" | "cozinha",
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  garcom: {
    label: "Garçom",
    bgColor: "#e0e7ff",
    textColor: "#4338ca",
    borderColor: "#c7d2fe",
  },
  cozinha: {
    label: "Cozinha",
    bgColor: "#ffedd5",
    textColor: "#c2410c",
    borderColor: "#fed7aa",
  },
};

interface Funcionario {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  birthDate: string;
  role: "garcom" | "cozinha";
  active: boolean;
}

interface FuncionariosTableProps {
  funcionarios: Funcionario[];
  pageItems: Funcionario[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  tableRef: (node: HTMLElement | null) => void;
}

const SKELETON_ROW_COUNT = 6;

export default function FuncionariosTable({
  funcionarios,
  pageItems,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  tableRef,
}: FuncionariosTableProps) {
  if (loading) {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-sm border border-(--color-border-subtle) bg-(--color-bg-surface)">
        <div className="flex w-full items-center gap-3 bg-(--color-bg-surface-elevated) px-4 py-3">
          {["Nome", "Função", "Telefone", "Status", "Ações"].map((label) => (
            <div
              key={label}
              className="min-w-35 flex-1 text-body-sm font-semibold text-(--color-text-secondary) first:flex-[2] last:flex last:justify-end"
            >
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
              <div className="h-6 w-16 rounded-full bg-(--color-status-neutral-bg)" />
            </div>
            <div className="min-w-35 flex-1">
              <div className="h-4 w-1/2 rounded bg-(--color-status-neutral-bg)" />
            </div>
            <div className="min-w-35 flex-1">
              <div className="h-6 w-14 rounded-full bg-(--color-status-neutral-bg)" />
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

  if (funcionarios.length === 0) {
    return (
      <EmptyState
        title="Nenhum funcionário cadastrado"
        subtitle="Adicione funcionários para organizar o atendimento."
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
            { key: "role", label: "Função" },
            { key: "phone", label: "Telefone" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Ações" },
          ]}
          rows={pageItems.map((funcionario) => ({
            name: (
              <span className="font-semibold text-(--color-text-primary)">
                {funcionario.name}
              </span>
            ),
            role: (
              <div
                className="inline-flex items-center px-2 py-1 rounded-full border text-label-sm font-semibold"
                style={{
                  backgroundColor: roleConfig[funcionario.role].bgColor,
                  color: roleConfig[funcionario.role].textColor,
                  borderColor: roleConfig[funcionario.role].borderColor,
                }}
              >
                {roleConfig[funcionario.role].label}
              </div>
            ),
            phone: funcionario.phone,
            status: (
              <Badge variant={funcionario.active ? "success" : "neutral"}>
                {funcionario.active ? "Ativo" : "Inativo"}
              </Badge>
            ),
            actions: (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onEdit(funcionario.id)}
                  aria-label={`Editar ${funcionario.name}`}
                  className="cursor-pointer text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
                >
                  <LuPencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(funcionario.id)}
                  aria-label={`Excluir ${funcionario.name}`}
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
