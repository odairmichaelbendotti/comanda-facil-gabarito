import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/**
 * Vertical space (px) a page should reserve below a paginated grid/table for
 * this component plus its own breathing room — pass as `reservedBottom` to
 * `useResponsiveGrid` so the computed page size leaves room for it.
 */
export const PAGINATION_RESERVED_HEIGHT = 96;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

const navButtonClasses =
  "flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-border-default) text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-bg-input) disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className={`flex items-center justify-center gap-2 pt-6 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={navButtonClasses}
      >
        <LuChevronLeft className="size-4" />
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-body-md text-(--color-text-tertiary)"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Página ${page}`}
              className={`flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-body-md font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) ${
                page === currentPage
                  ? "bg-(--color-brand-primary) text-white"
                  : "border border-(--color-border-default) text-(--color-text-secondary) hover:bg-(--color-bg-input)"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className={navButtonClasses}
      >
        <LuChevronRight className="size-4" />
      </button>
    </nav>
  );
}
