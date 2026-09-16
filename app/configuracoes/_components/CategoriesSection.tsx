import CategoryCard from "../../components/CategoryCard";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

interface CategoriesSectionProps {
  categories: Category[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  gridRef: (node: HTMLElement | null) => void;
}

const CATEGORY_CARD_MIN_WIDTH = 220;
const SKELETON_CARD_COUNT = 8;

export default function CategoriesSection({
  categories,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  gridRef,
}: CategoriesSectionProps) {
  if (loading) {
    return (
      <div
        className="grid w-full gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CATEGORY_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex h-24.5 w-full animate-pulse flex-col items-start gap-3 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-4 motion-reduce:animate-none"
          >
            <div className="flex w-full flex-col gap-1.5">
              <div className="h-4.5 w-2/3 rounded bg-(--color-status-neutral-bg)" />
              <div className="h-3.5 w-1/3 rounded bg-(--color-status-neutral-bg)" />
            </div>
            <div className="flex w-full items-center gap-2">
              <div className="h-6 w-14 rounded-full bg-(--color-status-neutral-bg)" />
              <div className="h-6 w-14 rounded-full bg-(--color-status-neutral-bg)" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Nenhuma categoria cadastrada"
          subtitle="Crie categorias para organizar o cardápio."
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        className="animate-fade-in-up grid w-full gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CATEGORY_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.name}
            subtitle={`${category.productCount} ${category.productCount === 1 ? "produto" : "produtos"}`}
            onEdit={() => onEdit(category.id)}
            onDelete={() => onDelete(category.id)}
          />
        ))}
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
