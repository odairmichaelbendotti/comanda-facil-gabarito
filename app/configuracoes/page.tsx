"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import CategoryModal, { CategoryFormValues } from "../components/CategoryModal";
import ConfirmationModal from "../components/ConfirmationModal";
import NewMesaModal from "../components/NewMesaModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoute";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import ConfiguracoesHeader from "./_components/ConfiguracoesHeader";
import ConfiguracoesTabBar from "./_components/ConfiguracoesTabBar";
import CategoriesSection from "./_components/CategoriesSection";
import MesasSection from "./_components/MesasSection";

type ConfigTab = "categorias" | "mesas";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

interface Mesa {
  id: string;
  number: number;
}

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <ConfiguracoesPageContent />
    </ProtectedRoute>
  );
}

function ConfiguracoesPageContent() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("categorias");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesasLoading, setMesasLoading] = useState(true);
  const [mesasError, setMesasError] = useState<string | null>(null);
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [mesaDeleteConfirmOpen, setMesaDeleteConfirmOpen] = useState(false);
  const [mesaToDelete, setMesaToDelete] = useState<string | null>(null);

  const nextMesaNumber = mesas.reduce((max, mesa) => Math.max(max, mesa.number), 0) + 1;

  useEffect(() => {
    let cancelled = false;

    // limit=500 asks for "all of them" in one page — the endpoint documents
    // this as intentional for callers (like this one) that paginate
    // client-side instead of server-side, via usePagination/useResponsiveGrid
    // below, which need the full list to slice from.
    fetch("/api/categorias?limit=500", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        const data = await response.json();

        if (!response.ok) {
          setCategoriesError(data.error || "Erro ao carregar categorias");
          return;
        }

        setCategories(
          data.items.map((item: { id: number; nome: string; descricao: string | null; totalProdutos: number }) => ({
            id: String(item.id),
            name: item.nome,
            description: item.descricao ?? "",
            productCount: item.totalProdutos,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setCategoriesError("Erro ao conectar com o servidor");
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Same "grab everything, page client-side" convention as categories —
    // no real salão has enough mesas to need server-side pagination.
    fetch("/api/mesas?limit=500", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        const data = await response.json();

        if (!response.ok) {
          setMesasError(data.error || "Erro ao carregar mesas");
          return;
        }

        setMesas(
          data.items.map((item: { id: number; numero: number }) => ({
            id: String(item.id),
            number: item.numero,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setMesasError("Erro ao conectar com o servidor");
      })
      .finally(() => {
        if (!cancelled) setMesasLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const editingCategory = categories.find((category) => category.id === editingCategoryId);
  const categoryDeleteInfo = categories.find((c) => c.id === categoryToDelete);
  const mesaDeleteInfo = mesas.find((m) => m.id === mesaToDelete);

  function openNewCategoryModal() {
    setEditingCategoryId(null);
    setCategoryModalOpen(true);
  }

  function openEditCategoryModal(id: string) {
    setEditingCategoryId(id);
    setCategoryModalOpen(true);
  }

  function openDeleteCategoryConfirm(id: string) {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;

    const response = await fetch(`/api/categorias/${categoryToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // Thrown, not swallowed: ConfirmationModal awaits this call and keeps
      // the modal open with the message on rejection (e.g. 422 "Ainda há
      // produtos ativos nessa categoria") instead of closing as if the
      // category had actually been removed.
      throw new Error(data.error || "Erro ao excluir categoria");
    }

    setCategories((current) =>
      current.filter((category) => category.id !== categoryToDelete),
    );
    setCategoryToDelete(null);
  }

  async function handleSubmitCategory(values: CategoryFormValues) {
    const response = await fetch(
      editingCategory ? `/api/categorias/${editingCategory.id}` : "/api/categorias",
      {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: values.name, descricao: values.description }),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      // Thrown, not swallowed: CategoryModal awaits this call and keeps the
      // modal open with the message on rejection instead of closing as if
      // the save had succeeded.
      throw new Error(data.error || "Erro ao salvar categoria");
    }

    const saved: Category = {
      id: String(data.id),
      name: data.nome,
      description: data.descricao ?? "",
      productCount: data.totalProdutos,
    };
    setCategories((current) =>
      editingCategory
        ? current.map((category) => (category.id === saved.id ? saved : category))
        : [...current, saved],
    );
  }

  async function handleAddMesa(number: number) {
    const response = await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: number }),
    });
    const data = await response.json();

    if (!response.ok) {
      // Thrown, not swallowed: NewMesaModal awaits this call and keeps the
      // modal open with the message on rejection (e.g. 409 "Já existe mesa
      // ativa com esse número") instead of closing as if it had worked.
      throw new Error(data.error || "Erro ao adicionar mesa");
    }

    setMesas((current) => [
      ...current,
      { id: String(data.id), number: data.numero },
    ]);
  }

  function openDeleteMesaConfirm(id: string) {
    setMesaToDelete(id);
    setMesaDeleteConfirmOpen(true);
  }

  async function handleConfirmDeleteMesa() {
    if (!mesaToDelete) return;

    const response = await fetch(`/api/mesas/${mesaToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // Thrown, not swallowed: ConfirmationModal awaits this call and keeps
      // the modal open with the message on rejection (e.g. 422 "Mesa tem
      // pedido em aberto") instead of closing as if it had been removed.
      throw new Error(data.error || "Erro ao remover mesa");
    }

    setMesas((current) => current.filter((mesa) => mesa.id !== mesaToDelete));
    setMesaToDelete(null);
  }

  const [categoriesPageSize, categoriesGridRef] = useResponsiveGrid({
    gap: 16,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    minColumns: 1,
    minRows: 1,
  });
  const categoriesPagination = usePagination(categories, categoriesPageSize);

  const [mesasPageSize, mesasGridRef] = useResponsiveGrid({
    gap: 16,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    minColumns: 1,
    minRows: 1,
  });
  const mesasPagination = usePagination(mesas, mesasPageSize);

  return (
    <AppShell activeHref="/configuracoes">
      <ConfiguracoesHeader
        activeTab={activeTab}
        onNewCategory={openNewCategoryModal}
        onNewMesa={() => setMesaModalOpen(true)}
      />

      <ConfiguracoesTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div key={activeTab} className="animate-fade-in-up flex flex-1 flex-col">
        {activeTab === "categorias" ? (
          categoriesError ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-body-sm text-(--color-status-danger-text)">
                {categoriesError}
              </p>
            </div>
          ) : (
            <CategoriesSection
              categories={categoriesPagination.pageItems}
              loading={categoriesLoading}
              currentPage={categoriesPagination.currentPage}
              totalPages={categoriesPagination.totalPages}
              onPageChange={categoriesPagination.setPage}
              onEdit={openEditCategoryModal}
              onDelete={openDeleteCategoryConfirm}
              gridRef={categoriesGridRef}
            />
          )
        ) : mesasError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body-sm text-(--color-status-danger-text)">
              {mesasError}
            </p>
          </div>
        ) : (
          <MesasSection
            mesas={mesasPagination.pageItems}
            loading={mesasLoading}
            currentPage={mesasPagination.currentPage}
            totalPages={mesasPagination.totalPages}
            onPageChange={mesasPagination.setPage}
            onRemove={openDeleteMesaConfirm}
            gridRef={mesasGridRef}
          />
        )}
      </div>

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleSubmitCategory}
        initialValues={
          editingCategory
            ? { name: editingCategory.name, description: editingCategory.description }
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDeleteCategory}
        title="Excluir Categoria?"
        description={`Tem certeza que deseja excluir "${categoryDeleteInfo?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDangerous
      />

      <NewMesaModal
        isOpen={mesaModalOpen}
        onClose={() => setMesaModalOpen(false)}
        onSubmit={handleAddMesa}
        suggestedNumber={nextMesaNumber}
      />

      <ConfirmationModal
        isOpen={mesaDeleteConfirmOpen}
        onClose={() => {
          setMesaDeleteConfirmOpen(false);
          setMesaToDelete(null);
        }}
        onConfirm={handleConfirmDeleteMesa}
        title="Remover Mesa?"
        description={`Tem certeza que deseja remover "Mesa ${mesaDeleteInfo?.number}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        isDangerous
      />
    </AppShell>
  );
}
