import { LuTriangleAlert } from "react-icons/lu";

export default function WarningHeader() {
  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 text-center sm:px-20">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-(--color-status-warning-text) bg-(--color-status-warning-bg)">
        <LuTriangleAlert className="size-5 text-(--color-status-warning-text)" />
      </div>
      <h1 className="font-display text-h2 text-(--color-text-primary)">
        Plano Premium Cancelado
      </h1>
      <p className="max-w-135 text-body-sm text-(--color-text-secondary)">
        Sua assinatura foi cancelada. Você ainda terá acesso completo a todos
        os recursos Premium até o término do período faturado atual.
      </p>
    </div>
  );
}
