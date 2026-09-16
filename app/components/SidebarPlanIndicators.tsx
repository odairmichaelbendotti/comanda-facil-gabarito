import { LuPackage, LuStar } from "react-icons/lu";

interface SidebarPlanIndicatorsProps {
  premium?: boolean;
  ordersUsed?: number;
  ordersLimit?: number;
  className?: string;
}

export default function SidebarPlanIndicators({
  premium = false,
  ordersUsed = 17,
  ordersLimit = 30,
  className = "",
}: SidebarPlanIndicatorsProps) {
  const usagePercent = Math.min(100, (ordersUsed / ordersLimit) * 100);

  return (
    <div className={`flex w-full flex-1 flex-col gap-3 ${className}`}>
      {premium ? (
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
      ) : (
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
      )}
    </div>
  );
}
