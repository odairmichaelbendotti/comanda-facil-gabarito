import { LuPackage, LuStar } from "react-icons/lu";

interface SidebarPlanIndicatorsProps {
  loading?: boolean;
  premium?: boolean;
  ordersUsed?: number;
  ordersLimit?: number;
  onUpgradeClick?: () => void;
  className?: string;
}

export default function SidebarPlanIndicators({
  loading = false,
  premium = false,
  ordersUsed = 17,
  ordersLimit = 30,
  onUpgradeClick,
  className = "",
}: SidebarPlanIndicatorsProps) {
  const usagePercent = Math.min(100, (ordersUsed / ordersLimit) * 100);

  if (loading) {
    return (
      <div className={`flex w-full flex-1 flex-col gap-3 ${className}`}>
        <div className="flex w-full animate-pulse flex-col gap-2.5 rounded-md border border-(--color-border-subtle) bg-(--color-status-neutral-bg) p-3 motion-reduce:animate-none">
          <div className="flex w-full items-center gap-2">
            <div className="size-4 shrink-0 rounded bg-(--color-status-neutral-border)" />
            <div className="h-3.5 w-24 rounded bg-(--color-status-neutral-border)" />
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <div className="h-3 w-32 rounded bg-(--color-status-neutral-border)" />
            <div className="h-1 w-full rounded-full bg-(--color-status-neutral-border)" />
          </div>
        </div>
      </div>
    );
  }

  if (premium) {
    return (
      <div className={`flex w-full flex-1 flex-col gap-3 ${className}`}>
        <div className="flex w-full flex-col gap-2.5 rounded-md border border-(--color-status-warning-border) bg-(--color-status-warning-bg) p-3">
          <div className="flex w-full items-center gap-2">
            <LuStar className="size-4 shrink-0 text-(--color-status-warning-text)" />
            <p className="text-label-sm font-semibold text-(--color-status-warning-text)">
              Restaurante Premium
            </p>
          </div>
          <p className="text-body-sm text-(--color-status-warning-text)">
            Pedidos ilimitados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-1 flex-col gap-3 ${className}`}>
      <div className="flex w-full flex-col gap-2.5 rounded-md border border-(--color-border-subtle) bg-(--color-status-neutral-bg) p-3">
        <div className="flex w-full items-center gap-2">
          <LuPackage className="size-4 shrink-0 text-(--color-text-secondary)" />
          <p className="text-label-sm font-semibold text-(--color-text-secondary)">
            Plano Gratuito
          </p>
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <p className="text-body-sm text-(--color-text-tertiary)">
            {ordersUsed} de {ordersLimit} pedidos utilizados
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-(--color-status-neutral-border)">
            <div
              className="h-full rounded-full bg-(--color-brand-primary)"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-md border border-(--color-status-warning-border) bg-(--color-status-warning-bg) p-3">
        <div className="flex w-full items-center gap-1.5">
          <LuStar className="size-3.5 shrink-0 text-(--color-status-warning-text)" />
          <p className="text-label-sm font-bold text-(--color-status-warning-text)">
            Desbloqueie tudo!
          </p>
        </div>
        <p className="text-body-sm text-(--color-status-warning-text)/70">
          Pedidos ilimitados e acesso a todos os recursos.
        </p>
        <button
          type="button"
          onClick={onUpgradeClick}
          className="w-full cursor-pointer rounded-sm bg-(--color-status-warning-text) py-1.5 text-label-sm font-semibold text-white transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-brand-accent-amber) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
        >
          Seja Premium
        </button>
      </div>
    </div>
  );
}
