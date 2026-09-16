import { LuCheck } from "react-icons/lu";
import Badge from "../../components/Badge";

interface PricingPlanCardProps {
  variant: "free" | "premium";
  current?: boolean;
  title?: string;
  description?: string;
  price?: string;
  benefits?: string[];
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export default function PricingPlanCard({
  variant = "free",
  current = false,
  title = "Plano",
  description = "",
  price = "0",
  benefits = [],
  actionLabel = "Selecionar",
  onAction,
  actionDisabled = false,
}: PricingPlanCardProps) {
  const isPremium = variant === "premium";

  return (
    <div
      className={`flex w-full max-w-115 flex-col gap-4 rounded-xl bg-(--color-bg-surface) p-6 ${
        isPremium
          ? "border-2 border-(--color-status-warning-text) shadow-lg"
          : "border border-(--color-border-default) shadow-sm"
      }`}
    >
      {isPremium && (
        <div className="flex w-full items-center justify-between">
          <Badge variant="warning">RECOMENDADO</Badge>
          <span className="text-label-sm font-bold tracking-wide text-(--color-text-brand)">
            POPULAR
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {current && (
          <p className="text-label-sm font-bold tracking-widest text-(--color-text-tertiary) uppercase">
            Plano atual
          </p>
        )}
        <h2 className="font-display text-h3 text-(--color-text-primary)">
          {title}
        </h2>
        <p className="text-body-sm text-(--color-text-secondary)">
          {description}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-body-md font-semibold text-(--color-text-secondary)">
          R$
        </span>
        <span className="font-display text-h2 text-(--color-text-primary)">
          {price}
        </span>
        <span className="text-body-sm text-(--color-text-tertiary)">/mês</span>
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <ul className="flex flex-col gap-2.5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5">
            <span
              className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                isPremium
                  ? "border-(--color-status-warning-text)"
                  : "border-(--color-text-secondary)"
              }`}
            >
              <LuCheck
                className={`size-2.5 ${
                  isPremium
                    ? "text-(--color-status-warning-text)"
                    : "text-(--color-text-secondary)"
                }`}
              />
            </span>
            <span
              className={`text-body-sm text-(--color-text-primary) ${
                isPremium ? "font-semibold" : ""
              }`}
            >
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      {isPremium ? (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="w-full cursor-pointer rounded-md bg-(--color-status-warning-text) px-5 py-2.5 text-button font-bold text-white transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-brand-accent-amber) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {actionLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="w-full cursor-pointer rounded-md border border-(--color-border-subtle) bg-(--color-bg-surface) px-5 py-2.5 text-button font-bold text-(--color-text-tertiary) transition-colors duration-150 motion-reduce:transition-none hover:border-(--color-border-focus) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) disabled:cursor-not-allowed disabled:hover:border-(--color-border-subtle) disabled:hover:text-(--color-text-tertiary)"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
