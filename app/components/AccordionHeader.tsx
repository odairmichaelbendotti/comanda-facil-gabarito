import { LuChevronRight } from "react-icons/lu";

interface AccordionHeaderProps {
  title?: string;
  itemCount?: number;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function AccordionHeader({
  title = "Categoria",
  itemCount,
  expanded = true,
  onToggle,
  className = "",
}: AccordionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-sm bg-[var(--color-bg-input)] px-4 py-3 text-left transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--color-status-neutral-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${className}`}
    >
      <span
        className={`min-w-0 flex-1 text-body-md text-[color:var(--color-text-primary)] ${
          expanded ? "font-semibold" : "font-medium"
        }`}
      >
        {title}
      </span>
      {!expanded && itemCount !== undefined && (
        <span className="shrink-0 text-body-sm text-[color:var(--color-text-secondary)]">
          ({itemCount} {itemCount === 1 ? "item" : "itens"})
        </span>
      )}
      <LuChevronRight
        className={`size-3 shrink-0 text-[color:var(--color-text-secondary)] transition-[rotate] duration-150 motion-reduce:transition-none ${
          expanded ? "rotate-90" : "rotate-0"
        }`}
      />
    </button>
  );
}
