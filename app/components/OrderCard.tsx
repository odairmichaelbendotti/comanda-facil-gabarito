import Badge from "./Badge";
import Button from "./Button";

interface OrderCardProps {
  title?: string;
  status?: string;
  statusVariant?: "neutral" | "success" | "warning" | "danger" | "info";
  itemsCount?: number;
  itemsSummary?: string;
  total?: string;
  onClick?: () => void;
  className?: string;
}

export default function OrderCard({
  title = "Mesa 1",
  status = "Em produção",
  statusVariant = "neutral",
  itemsCount = 1,
  itemsSummary = "1x Item",
  total = "R$ 0,00",
  onClick,
  className = "",
}: OrderCardProps) {
  return (
    <div
      className={`flex w-full flex-col gap-4 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-5 shadow-sm transition-colors duration-150 motion-reduce:transition-none hover:border-(--color-border-focus) hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 text-body-lg font-extrabold text-(--color-text-primary)">
          {title}
        </p>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-body-sm text-(--color-text-tertiary)">
          Itens: {itemsCount}
        </p>
        <p className="truncate text-body-sm text-(--color-text-secondary)">
          {itemsSummary}
        </p>
      </div>
      <div className="h-px w-full bg-(--color-border-subtle)" />
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-body-sm text-(--color-text-tertiary)">Total</p>
          <p className="text-body-lg font-extrabold text-(--color-text-brand)">
            {total}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClick}>
          Detalhes
        </Button>
      </div>
    </div>
  );
}
