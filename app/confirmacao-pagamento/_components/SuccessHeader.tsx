import { LuCheck } from "react-icons/lu";

export default function SuccessHeader() {
  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 text-center sm:px-20">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-(--color-status-success-border) bg-(--color-status-success-bg)">
        <LuCheck className="size-5 text-(--color-status-success-text)" />
      </div>
      <h1 className="font-display text-h2 text-(--color-text-primary)">
        Pagamento Confirmado!
      </h1>
      <p className="max-w-135 text-body-sm text-(--color-text-secondary)">
        Seu plano Premium foi ativado com sucesso. Aproveite todos os recursos
        sem limites e otimize a gestão do seu restaurante.
      </p>
    </div>
  );
}
