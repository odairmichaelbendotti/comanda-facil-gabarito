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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  gridRef: (node: HTMLElement | null) => void;
}

const CATEGORY_CARD_MIN_WIDTH = 220;

export default function CategoriesSection({
  categories,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  gridRef,
}: CategoriesSectionProps) {
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
        className="grid w-full gap-4"
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
