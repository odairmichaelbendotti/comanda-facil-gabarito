interface TabProps {
  label?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Tab({
  label = "Tab",
  active = false,
  onClick,
  className = "",
}: TabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${className}`}
    >
      <span
        className={`text-body-md font-semibold whitespace-nowrap ${
          active
            ? "text-[color:var(--color-brand-primary)]"
            : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        }`}
      >
        {label}
      </span>
      <span
        className={`h-0.5 w-full rounded-full ${
          active
            ? "bg-[var(--color-brand-primary)]"
            : "bg-[var(--color-border-subtle)]"
        }`}
      />
    </button>
  );
}
