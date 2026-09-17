import { ComponentType, ReactNode } from "react";
import { LuArrowDown, LuCalendar } from "react-icons/lu";

interface TimelineStepProps {
  icon: ComponentType<{ className?: string }>;
  tone: "info" | "danger";
  title: string;
  children: ReactNode;
}

const toneClasses = {
  info: {
    bg: "bg-(--color-status-info-bg)",
    icon: "text-(--color-status-info-text)",
  },
  danger: {
    bg: "bg-(--color-status-danger-bg)",
    icon: "text-(--color-status-danger-text)",
  },
};

function TimelineStep({ icon: Icon, tone, title, children }: TimelineStepProps) {
  return (
    <div className="flex w-full items-start gap-3">
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${toneClasses[tone].bg}`}
      >
        <Icon className={`size-3.5 ${toneClasses[tone].icon}`} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-body-sm font-bold text-(--color-text-primary)">
          {title}
        </p>
        <p className="text-body-sm text-(--color-text-secondary)">
          {children}
        </p>
      </div>
    </div>
  );
}

interface TimelineCardProps {
  dataLimite?: string;
}

export default function TimelineCard({
  dataLimite = "15/04/2026",
}: TimelineCardProps) {
  return (
    <div className="flex w-full max-w-120 flex-col gap-4 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 shadow-lg">
      <div className="flex flex-col gap-1">
        <p className="text-label-sm font-bold tracking-widest text-(--color-text-tertiary) uppercase">
          Cronograma de Alteração
        </p>
        <h2 className="font-display text-h3 text-(--color-text-primary)">
          O que acontece a seguir?
        </h2>
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <div className="flex w-full flex-col gap-4">
        <TimelineStep icon={LuCalendar} tone="info" title="Acesso Garantido">
          Sua conta continuará Premium com recursos ilimitados até o dia{" "}
          <strong className="font-bold">{dataLimite}</strong>.
        </TimelineStep>
        <TimelineStep
          icon={LuArrowDown}
          tone="danger"
          title="Retorno ao Plano Gratuito"
        >
          Após essa data, sua conta voltará automaticamente ao Plano Gratuito,
          limitando a <strong className="font-bold">30 pedidos/mês</strong> e{" "}
          <strong className="font-bold">1 funcionário</strong>.
        </TimelineStep>
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <p className="w-full text-center text-label-sm text-(--color-text-tertiary)">
        Nenhum dado cadastrado ou cardápio configurado será excluído.
      </p>
    </div>
  );
}
