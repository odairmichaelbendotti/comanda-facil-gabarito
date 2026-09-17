"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import NewProductModal, {
  NewProductInput,
  ProductCategoryOption,
} from "../components/NewProductModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import ProtectedRoute from "../components/ProtectedRoute";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import ProdutosHeader from "./_components/ProdutosHeader";
import ProdutosTable from "./_components/ProdutosTable";

function firstTableRow(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-table-row]");
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoriaId: number;
  disponivel: boolean;
}

interface ApiProduto {
  id: number;
  nome: string;
  preco: string;
  disponivel: boolean;
  categoria: { id: number; nome: string };
}

function mapApiProduto(produto: ApiProduto): Product {
  return {
    id: String(produto.id),
    name: produto.nome,
    price: Number(produto.preco),
    category: produto.categoria.nome,
    categoriaId: produto.categoria.id,
    disponivel: produto.disponivel,
  };
}

export default function ProdutosPage() {
  return (
    <ProtectedRoute>
      <ProdutosPageContent />
    </ProtectedRoute>
  );
}

function ProdutosPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategoryOption[]>([]);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const editingProduct = products.find(
    (product) => product.id === editingProductId,
  );
  const productDeleteInfo = products.find((p) => p.id === productToDelete);

  useEffect(() => {
    let cancelled = false;

    // limit=500 asks for "all of them" in one page — pagination here is
    // client-side (usePagination/useResponsiveGrid below slice a full
    // in-memory list), same convention as /configuracoes' categories fetch.
    Promise.all([
      fetch("/api/produtos?limit=500", { cache: "no-store" }).then((res) =>
        res.json().then((data) => ({ ok: res.ok, data })),
      ),
      fetch("/api/categorias?limit=500", { cache: "no-store" }).then((res) =>
        res.json().then((data) => ({ ok: res.ok, data })),
      ),
    ])
      .then(([produtosRes, categoriasRes]) => {
        if (cancelled) return;

        if (!produtosRes.ok) {
          setProductsError(produtosRes.data.error || "Erro ao carregar produtos");
          return;
        }
        setProducts(produtosRes.data.items.map(mapApiProduto));

        if (categoriasRes.ok) {
          setCategories(
            categoriasRes.data.items.map((item: { id: number; nome: string }) => ({
              id: item.id,
              nome: item.nome,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setProductsError("Erro ao conectar com o servidor");
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function openNewProductModal() {
    setEditingProductId(null);
    setNewProductOpen(true);
  }

  function openEditProductModal(id: string) {
    setEditingProductId(id);
    setNewProductOpen(true);
  }

  function openDeleteConfirm(id: string) {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;

    const response = await fetch(`/api/produtos/${productToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Erro ao excluir produto");
    }

    setProducts((current) =>
      current.filter((product) => product.id !== productToDelete),
    );
    setProductToDelete(null);
  }

  async function handleSubmitProduct(values: NewProductInput) {
    const payload = {
      nome: values.name,
      preco: values.price,
      categoriaId: values.categoriaId,
    };

    const response = await fetch(
      editingProduct ? `/api/produtos/${editingProduct.id}` : "/api/produtos",
      {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao salvar produto");
    }

    const saved = mapApiProduto(data);
    setProducts((current) =>
      editingProduct
        ? current.map((product) => (product.id === saved.id ? saved : product))
        : [...current, saved],
    );
  }

  async function handleToggleDisponivel(id: string, disponivel: boolean) {
    setTogglingIds((current) => new Set(current).add(id));
    // Optimistic: flips immediately, reverted below only if the request
    // fails — a network hiccup shouldn't leave the switch stuck showing the
    // old value while the request is still in flight.
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, disponivel } : product)),
    );

    try {
      const response = await fetch(`/api/produtos/${id}/disponibilidade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponivel }),
      });

      if (!response.ok) {
        setProducts((current) =>
          current.map((product) =>
            product.id === id ? { ...product, disponivel: !disponivel } : product,
          ),
        );
      }
    } catch {
      setProducts((current) =>
        current.map((product) =>
          product.id === id ? { ...product, disponivel: !disponivel } : product,
        ),
      );
    } finally {
      setTogglingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  const [pageSize, tableRef] = useResponsiveGrid({
    gap: 0,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    columns: 1,
    minRows: 3,
    getItemElement: firstTableRow,
  });
  const { currentPage, totalPages, pageItems, setPage } = usePagination(
    products,
    pageSize,
  );

  return (
    <AppShell activeHref="/produtos">
      <ProdutosHeader onNewProduct={openNewProductModal} />

      <div className="flex flex-1 flex-col">
        {productsError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body-sm text-(--color-status-danger-text)">
              {productsError}
            </p>
          </div>
        ) : (
          <ProdutosTable
            products={products}
            pageItems={pageItems}
            loading={productsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={openEditProductModal}
            onDelete={openDeleteConfirm}
            onToggleDisponivel={handleToggleDisponivel}
            togglingIds={togglingIds}
            tableRef={tableRef}
          />
        )}
      </div>

      <NewProductModal
        isOpen={newProductOpen}
        onClose={() => setNewProductOpen(false)}
        onCreate={handleSubmitProduct}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                price: editingProduct.price,
                categoriaId: editingProduct.categoriaId,
              }
            : undefined
        }
        categories={categories}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto?"
        description={`Tem certeza que deseja excluir "${productDeleteInfo?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDangerous
      />
    </AppShell>
  );
}
