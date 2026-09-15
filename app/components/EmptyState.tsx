import { ReactNode } from "react";
import { LuInbox } from "react-icons/lu";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function EmptyState({
  icon = <LuInbox className="size-6" />,
  title = "Nenhum item encontrado",
  subtitle = "Adicione novos itens para começar.",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex w-full max-w-100 flex-col items-center justify-center gap-4 px-8 py-16 text-center ${className}`}
    >
      <div className="flex size-16 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-input)] text-[color:var(--color-text-tertiary)]">
        {icon}
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-h3 font-medium text-[color:var(--color-text-primary)]">
          {title}
        </p>
        <p className="text-body-md text-[color:var(--color-text-secondary)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
