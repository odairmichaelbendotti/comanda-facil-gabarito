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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  tableRef: (node: HTMLElement | null) => void;
}

export default function FuncionariosTable({
  funcionarios,
  pageItems,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  tableRef,
}: FuncionariosTableProps) {
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
