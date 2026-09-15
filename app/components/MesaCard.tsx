import { LuX } from "react-icons/lu";

interface MesaCardProps {
  number?: string;
  label?: string;
  onRemove?: () => void;
  className?: string;
}

export default function MesaCard({
  number = "1",
  label = "Mesa 1",
  onRemove,
  className = "",
}: MesaCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-lg border border-(--color-border-subtle) bg-(--color-bg-surface) p-3 shadow-sm ${className}`}
    >
      <p className="text-body-md leading-8 font-bold text-(--color-text-primary)">
        {number}
      </p>
      <p className="text-label-sm text-(--color-text-secondary)">{label}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${label}`}
        className="absolute top-2.75 right-2.75 flex size-5 cursor-pointer items-center justify-center rounded-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-status-danger-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
      >
        <LuX className="size-3" />
      </button>
    </div>
  );
}
