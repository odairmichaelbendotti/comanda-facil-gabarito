interface FilterTabProps {
  label?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function FilterTab({
  label = "Todos",
  active = false,
  onClick,
  className = "",
}: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-4 py-3 text-label-sm font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${
        active
          ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]"
          : "border border-[var(--color-border-default)] text-[color:var(--color-text-secondary)] hover:border-[var(--color-border-focus)] hover:text-[color:var(--color-text-primary)]"
      } ${className}`}
    >
      {label}
    </button>
  );
}
