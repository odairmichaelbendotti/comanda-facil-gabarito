interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label = "Alternar",
  className = "",
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-(--color-brand-primary)" : "bg-(--color-border-default)"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-[translate] duration-150 motion-reduce:transition-none ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
