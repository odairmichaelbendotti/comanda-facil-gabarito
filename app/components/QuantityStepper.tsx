import { LuMinus, LuPlus } from "react-icons/lu";

interface QuantityStepperProps {
  value?: number;
  min?: number;
  max?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  className?: string;
}

export default function QuantityStepper({
  value = 0,
  min = 0,
  max,
  onIncrease,
  onDecrease,
  className = "",
}: QuantityStepperProps) {
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label="Diminuir quantidade"
        className="flex size-7 cursor-pointer items-center justify-center rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-status-neutral-bg)] text-[color:var(--color-text-secondary)] transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--color-border-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LuMinus className="size-3" />
      </button>
      <span
        className={`w-5 text-center text-body-md font-bold ${
          value > 0
            ? "text-[color:var(--color-brand-primary)]"
            : "text-[color:var(--color-text-tertiary)]"
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label="Aumentar quantidade"
        className="flex size-7 cursor-pointer items-center justify-center rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-status-neutral-bg)] text-[color:var(--color-text-secondary)] transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--color-border-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LuPlus className="size-3" />
      </button>
    </div>
  );
}
