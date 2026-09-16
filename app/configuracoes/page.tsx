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

const initialMesas: Mesa[] = Array.from({ length: 20 }, (_, index) => ({
  id: `mesa-${index + 1}`,
  number: index + 1,
}));

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
  const [mesas, setMesas] = useState<Mesa[]>(initialMesas);
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

  function handleConfirmDeleteCategory() {
    if (categoryToDelete) {
      setCategories((current) =>
        current.filter((category) => category.id !== categoryToDelete),
      );
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  }

  async function handleSubmitCategory(values: CategoryFormValues) {
    if (editingCategory) {
      // No PATCH /api/categorias endpoint yet — editing stays local-only
      // until one exists.
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategory.id ? { ...category, ...values } : category,
        ),
      );
      return;
    }

    const response = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: values.name, descricao: values.description }),
    });
    const data = await response.json();

    if (!response.ok) {
      // Thrown, not swallowed: CategoryModal awaits this call and keeps the
      // modal open with the message on rejection instead of closing as if
      // the category had been created.
      throw new Error(data.error || "Erro ao criar categoria");
    }

    setCategories((current) => [
      ...current,
      {
        id: String(data.id),
        name: data.nome,
        description: data.descricao ?? "",
        productCount: data.totalProdutos,
      },
    ]);
  }

  function handleAddMesa(number: number) {
    setMesas((current) => [...current, { id: crypto.randomUUID(), number }]);
  }

  function openDeleteMesaConfirm(id: string) {
    setMesaToDelete(id);
    setMesaDeleteConfirmOpen(true);
  }

  function handleConfirmDeleteMesa() {
    if (mesaToDelete) {
      setMesas((current) =>
        current.filter((mesa) => mesa.id !== mesaToDelete),
      );
      setMesaDeleteConfirmOpen(false);
      setMesaToDelete(null);
    }
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
        ) : (
          <MesasSection
            mesas={mesasPagination.pageItems}
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
