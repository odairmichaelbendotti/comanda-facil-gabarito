interface CategoryCardProps {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const pillButtonClasses =
  "cursor-pointer rounded-full px-2.5 py-1.5 text-label-sm font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)";

export default function CategoryCard({
  title = "Categoria",
  subtitle = "ID: 000000000-00000",
  onClick,
  onEdit,
  onDelete,
  className = "",
}: CategoryCardProps) {
  const hasActions = !!onEdit || !!onDelete;

  const content = (
    <>
      <div className="flex w-full flex-col gap-0.5">
        <span className="text-body-lg font-extrabold text-(--color-text-primary)">
          {title}
        </span>
        <span className="text-body-sm text-(--color-text-tertiary)">
          {subtitle}
        </span>
      </div>
      {hasActions && (
        <div className="flex w-full items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className={`${pillButtonClasses} border border-(--color-border-subtle) bg-(--color-bg-input) text-(--color-text-secondary) hover:bg-(--color-border-subtle)`}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className={`${pillButtonClasses} border border-(--color-status-danger-border) bg-(--color-status-danger-bg) text-(--color-status-danger-text) hover:bg-(--color-status-danger-border)`}
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </>
  );

  const sharedClasses = `flex w-full flex-col items-start gap-3 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-4 text-left shadow-sm transition-colors duration-150 motion-reduce:transition-none ${className}`;

  if (hasActions) {
    return <div className={sharedClasses}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sharedClasses} cursor-pointer hover:border-(--color-border-focus) hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)`}
    >
      {content}
    </button>
  );
}
