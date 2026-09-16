"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import NewProductModal, {
  NewProductInput,
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
}

const initialProducts: Product[] = [
  { id: "coca-cola", name: "Coca-Cola Lata", price: 6, category: "Bebidas" },
  { id: "guarana", name: "Guaraná Lata", price: 5, category: "Bebidas" },
  { id: "agua-mineral", name: "Água Mineral", price: 6, category: "Bebidas" },
  { id: "suco-natural", name: "Suco Natural", price: 8, category: "Bebidas" },
  { id: "calabresa", name: "Pizza Calabresa", price: 48, category: "Pizzas" },
  { id: "marguerita", name: "Pizza Marguerita", price: 42, category: "Pizzas" },
  {
    id: "frango-catupiry",
    name: "Pizza Frango c/ Catupiry",
    price: 50,
    category: "Pizzas",
  },
  { id: "picanha", name: "Picanha", price: 40, category: "Pratos" },
  { id: "pudim", name: "Pudim", price: 10, category: "Sobremesas" },
  {
    id: "petit-gateau",
    name: "Petit Gateau",
    price: 14,
    category: "Sobremesas",
  },
  { id: "agua-com-gas", name: "Água com Gás", price: 6, category: "Bebidas" },
  { id: "cerveja", name: "Cerveja Long Neck", price: 12, category: "Bebidas" },
  { id: "portuguesa", name: "Pizza Portuguesa", price: 46, category: "Pizzas" },
  {
    id: "quatro-queijos",
    name: "Pizza Quatro Queijos",
    price: 52,
    category: "Pizzas",
  },
  { id: "batata-frita", name: "Batata Frita", price: 22, category: "Pratos" },
  { id: "isca-frango", name: "Isca de Frango", price: 28, category: "Pratos" },
  {
    id: "mousse-chocolate",
    name: "Mousse de Chocolate",
    price: 12,
    category: "Sobremesas",
  },
];

export default function ProdutosPage() {
  return (
    <ProtectedRoute>
      <ProdutosPageContent />
    </ProtectedRoute>
  );
}

function ProdutosPageContent() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const editingProduct = products.find(
    (product) => product.id === editingProductId,
  );
  const productDeleteInfo = products.find((p) => p.id === productToDelete);

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

  function handleConfirmDelete() {
    if (productToDelete) {
      setProducts((current) =>
        current.filter((product) => product.id !== productToDelete),
      );
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  }

  function handleSubmitProduct(product: NewProductInput) {
    if (editingProduct) {
      setProducts((current) =>
        current.map((item) =>
          item.id === editingProduct.id ? { ...item, ...product } : item,
        ),
      );
      return;
    }
    setProducts((current) => [
      ...current,
      { id: crypto.randomUUID(), ...product },
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
    products,
    pageSize,
  );

  return (
    <AppShell activeHref="/produtos">
      <ProdutosHeader onNewProduct={openNewProductModal} />

      <div className="flex flex-1 flex-col">
        <ProdutosTable
          products={products}
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={openEditProductModal}
          onDelete={openDeleteConfirm}
          tableRef={tableRef}
        />
      </div>

      <NewProductModal
        isOpen={newProductOpen}
        onClose={() => setNewProductOpen(false)}
        onCreate={handleSubmitProduct}
        initialValues={editingProduct}
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
