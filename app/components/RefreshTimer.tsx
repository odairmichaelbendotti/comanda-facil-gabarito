import { LuRefreshCw } from "react-icons/lu";

interface RefreshTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  onRefreshNow: () => void;
  className?: string;
}

export default function RefreshTimer({
  secondsLeft,
  totalSeconds,
  onRefreshNow,
  className = "",
}: RefreshTimerProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (secondsLeft / totalSeconds) * 100),
  );

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      <div className="flex w-full items-center justify-between text-label-sm">
        <p className="text-(--color-text-tertiary)">Buscando pedidos em</p>
        <p className="font-semibold text-(--color-text-secondary)">
          {secondsLeft}s
        </p>
      </div>

      <div className="h-0.75 w-full overflow-hidden rounded-full bg-(--color-status-neutral-bg)">
        <div
          className="h-full rounded-full bg-(--color-brand-primary) transition-[width] duration-1000 motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <button
        type="button"
        onClick={onRefreshNow}
        className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm bg-(--color-brand-primary) px-2.5 py-1.5 text-label-sm font-medium text-(--color-brand-on-primary) transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-brand-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
      >
        <LuRefreshCw className="size-3" />
        Buscar pedidos agora
      </button>
    </div>
  );
}
