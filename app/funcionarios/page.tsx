"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import FuncionarioModal, {
  FuncionarioFormValues,
} from "../components/FuncionarioModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoute";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import FuncionariosHeader from "./_components/FuncionariosHeader";
import FuncionariosTable from "./_components/FuncionariosTable";

function firstTableRow(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-table-row]");
}

interface Funcionario {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  birthDate: string;
  role: "garcom" | "cozinha";
  active: boolean;
}

const initialFuncionarios: Funcionario[] = [
  {
    id: "carlos-silva",
    name: "Carlos Silva",
    phone: "(11) 98765-4321",
    cpf: "12345678910",
    birthDate: "14051992",
    role: "garcom",
    active: true,
  },
  {
    id: "ana-oliveira",
    name: "Ana Oliveira",
    phone: "(11) 97654-3210",
    cpf: "98765432100",
    birthDate: "22111995",
    role: "cozinha",
    active: true,
  },
  {
    id: "joao-santos",
    name: "João Santos",
    phone: "(11) 96543-2109",
    cpf: "45678912312",
    birthDate: "08021988",
    role: "garcom",
    active: false,
  },
  {
    id: "maria-costa",
    name: "Maria Costa",
    phone: "(11) 95432-1098",
    cpf: "32165498700",
    birthDate: "30071990",
    role: "cozinha",
    active: true,
  },
  {
    id: "pedro-almeida",
    name: "Pedro Almeida",
    phone: "(11) 94321-0987",
    cpf: "65498732100",
    birthDate: "19091985",
    role: "garcom",
    active: true,
  },
  {
    id: "juliana-ramos",
    name: "Juliana Ramos",
    phone: "(11) 93210-8765",
    cpf: "11122233344",
    birthDate: "05031993",
    role: "cozinha",
    active: true,
  },
  {
    id: "rafael-lima",
    name: "Rafael Lima",
    phone: "(11) 92109-8754",
    cpf: "22233344455",
    birthDate: "17062000",
    role: "garcom",
    active: false,
  },
  {
    id: "camila-rocha",
    name: "Camila Rocha",
    phone: "(11) 91098-7643",
    cpf: "33344455566",
    birthDate: "29121991",
    role: "cozinha",
    active: true,
  },
  {
    id: "bruno-teixeira",
    name: "Bruno Teixeira",
    phone: "(11) 90987-6532",
    cpf: "44455566677",
    birthDate: "11041987",
    role: "garcom",
    active: true,
  },
  {
    id: "fernanda-castro",
    name: "Fernanda Castro",
    phone: "(11) 89876-5421",
    cpf: "55566677788",
    birthDate: "23081996",
    role: "cozinha",
    active: false,
  },
  {
    id: "thiago-moura",
    name: "Thiago Moura",
    phone: "(11) 88765-4310",
    cpf: "66677788899",
    birthDate: "02102003",
    role: "garcom",
    active: true,
  },
  {
    id: "patricia-alves",
    name: "Patrícia Alves",
    phone: "(11) 87654-3209",
    cpf: "77788899900",
    birthDate: "14071989",
    role: "cozinha",
    active: true,
  },
];

export default function FuncionariosPage() {
  return (
    <ProtectedRoute>
      <FuncionariosPageContent />
    </ProtectedRoute>
  );
}

function FuncionariosPageContent() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(
    initialFuncionarios,
  );
  const [funcionarioModalOpen, setFuncionarioModalOpen] = useState(false);
  const [editingFuncionarioId, setEditingFuncionarioId] = useState<
    string | null
  >(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<
    string | null
  >(null);

  const editingFuncionario = funcionarios.find(
    (funcionario) => funcionario.id === editingFuncionarioId,
  );
  const funcionarioDeleteInfo = funcionarios.find(
    (f) => f.id === funcionarioToDelete,
  );

  function openNewFuncionarioModal() {
    setEditingFuncionarioId(null);
    setFuncionarioModalOpen(true);
  }

  function openEditFuncionarioModal(id: string) {
    setEditingFuncionarioId(id);
    setFuncionarioModalOpen(true);
  }

  function openDeleteConfirm(id: string) {
    setFuncionarioToDelete(id);
    setDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (funcionarioToDelete) {
      setFuncionarios((current) =>
        current.filter((funcionario) => funcionario.id !== funcionarioToDelete),
      );
      setDeleteConfirmOpen(false);
      setFuncionarioToDelete(null);
    }
  }

  function handleSubmitFuncionario(values: FuncionarioFormValues) {
    if (editingFuncionario) {
      setFuncionarios((current) =>
        current.map((funcionario) =>
          funcionario.id === editingFuncionario.id
            ? {
                ...funcionario,
                name: values.name,
                cpf: values.cpf,
                birthDate: values.birthDate,
                role: values.role,
              }
            : funcionario,
        ),
      );
      return;
    }
    setFuncionarios((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: values.name,
        cpf: values.cpf,
        birthDate: values.birthDate,
        role: values.role,
        phone: "",
        active: true,
      },
    ]);
  }

  const [pageSize, tableRef] = useResponsiveGrid({
    gap: 0,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    columns: 1,
    minRows: 3,
    getItemElement: firstTableRow,
  });
  const { currentPage, totalPages, pageItems, setPage } = usePagination(
    funcionarios,
    pageSize,
  );

  return (
    <AppShell activeHref="/funcionarios">
      <FuncionariosHeader onNewFuncionario={openNewFuncionarioModal} />

      <div className="flex flex-1 flex-col">
        <FuncionariosTable
          funcionarios={funcionarios}
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={openEditFuncionarioModal}
          onDelete={openDeleteConfirm}
          tableRef={tableRef}
        />
      </div>

      <FuncionarioModal
        isOpen={funcionarioModalOpen}
        onClose={() => setFuncionarioModalOpen(false)}
        onSubmit={handleSubmitFuncionario}
        initialValues={
          editingFuncionario
            ? {
                name: editingFuncionario.name,
                cpf: editingFuncionario.cpf,
                birthDate: editingFuncionario.birthDate,
                role: editingFuncionario.role,
              }
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFuncionarioToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Funcionário?"
        description={`Tem certeza que deseja excluir "${funcionarioDeleteInfo?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDangerous
      />
    </AppShell>
  );
}
