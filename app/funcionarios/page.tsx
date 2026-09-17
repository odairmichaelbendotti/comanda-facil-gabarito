"use client";

import { useEffect, useState } from "react";
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

// MaskedInput's date field works in DD MM YYYY (unmasked) order, while the
// API speaks ISO ("YYYY-MM-DD") — these two just cross that boundary.
function isoToBirthDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}${month}${year}`;
}

function birthDateToIso(birthDate: string) {
  const day = birthDate.slice(0, 2);
  const month = birthDate.slice(2, 4);
  const year = birthDate.slice(4, 8);
  return `${year}-${month}-${day}`;
}

export default function FuncionariosPage() {
  return (
    <ProtectedRoute>
      <FuncionariosPageContent />
    </ProtectedRoute>
  );
}

function FuncionariosPageContent() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [funcionarioModalOpen, setFuncionarioModalOpen] = useState(false);
  const [editingFuncionarioId, setEditingFuncionarioId] = useState<
    string | null
  >(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/funcionarios?limit=500", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        const data = await response.json();
        if (!response.ok) {
          setLoadError(data.error || "Erro ao carregar funcionários");
          return;
        }
        setFuncionarios(
          data.items.map(
            (item: {
              id: number;
              nome: string;
              documento: string;
              dataNascimento: string;
              role: "garcom" | "cozinha";
              telefone: string | null;
              ativo: boolean;
            }) => ({
              id: String(item.id),
              name: item.nome,
              phone: item.telefone ?? "",
              cpf: item.documento,
              birthDate: isoToBirthDate(item.dataNascimento),
              role: item.role,
              active: item.ativo,
            }),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError("Erro ao conectar com o servidor");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleConfirmDelete() {
    if (!funcionarioToDelete) return;
    const response = await fetch(`/api/funcionarios/${funcionarioToDelete}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Erro ao excluir funcionário");
    }
    setFuncionarios((current) =>
      current.filter((funcionario) => funcionario.id !== funcionarioToDelete),
    );
    setFuncionarioToDelete(null);
  }

  async function handleSubmitFuncionario(values: FuncionarioFormValues) {
    const body: Record<string, unknown> = {
      nome: values.name,
      documento: values.cpf,
      dataNascimento: birthDateToIso(values.birthDate),
      role: values.role,
    };
    if (values.password.trim()) {
      body.senha = values.password;
    }

    if (editingFuncionario) {
      const response = await fetch(
        `/api/funcionarios/${editingFuncionario.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar funcionário");
      }
      setFuncionarios((current) =>
        current.map((funcionario) =>
          funcionario.id === editingFuncionario.id
            ? {
                ...funcionario,
                name: data.nome,
                cpf: data.documento,
                birthDate: isoToBirthDate(data.dataNascimento),
                role: data.role,
                phone: data.telefone ?? funcionario.phone,
                active: data.ativo,
              }
            : funcionario,
        ),
      );
      return;
    }

    const response = await fetch("/api/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao adicionar funcionário");
    }
    setFuncionarios((current) => [
      ...current,
      {
        id: String(data.id),
        name: data.nome,
        cpf: data.documento,
        birthDate: isoToBirthDate(data.dataNascimento),
        role: data.role,
        phone: data.telefone ?? "",
        active: data.ativo,
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
        {loadError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body-sm text-(--color-status-danger-text)">
              {loadError}
            </p>
          </div>
        ) : (
          <FuncionariosTable
            funcionarios={funcionarios}
            loading={loading}
            pageItems={pageItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={openEditFuncionarioModal}
            onDelete={openDeleteConfirm}
            tableRef={tableRef}
          />
        )}
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
