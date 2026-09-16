import { ReactNode } from "react";
import { LuCreditCard, LuLock } from "react-icons/lu";

interface ReceiptCardProps {
  plano?: string;
  valor?: string;
  proximaCobranca?: string;
  cartaoFinal?: string;
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex w-full items-center justify-between text-body-sm">
      <p className="text-(--color-text-secondary)">{label}</p>
      {children}
    </div>
  );
}

export default function ReceiptCard({
  plano = "Plano Premium",
  valor = "R$ 49,90/mês",
  proximaCobranca = "Em 30 dias",
  cartaoFinal = "4242",
}: ReceiptCardProps) {
  return (
    <div className="flex w-full max-w-120 flex-col gap-4 rounded-xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-6 shadow-lg">
      <div className="flex flex-col gap-1">
        <p className="text-label-sm font-bold tracking-widest text-(--color-text-tertiary) uppercase">
          Detalhes da Transação
        </p>
        <h2 className="font-display text-h3 text-(--color-text-primary)">
          Recibo de Ativação
        </h2>
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <div className="flex w-full flex-col gap-2.5">
        <DetailRow label="Plano Selecionado">
          <p className="font-bold text-(--color-text-primary)">{plano}</p>
        </DetailRow>
        <DetailRow label="Valor Recorrente">
          <p className="font-bold text-(--color-text-primary)">{valor}</p>
        </DetailRow>
        <DetailRow label="Próxima Cobrança">
          <p className="font-medium text-(--color-text-primary)">
            {proximaCobranca}
          </p>
        </DetailRow>
        <DetailRow label="Método de Pagamento">
          <span className="flex items-center gap-1.5 font-medium text-(--color-text-primary)">
            <LuCreditCard className="size-4 shrink-0" />
            •••• {cartaoFinal}
          </span>
        </DetailRow>
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <div className="flex w-full items-center gap-2 rounded-md bg-(--color-status-success-bg) p-2.5">
        <LuLock className="size-4 shrink-0 text-(--color-status-success-text)" />
        <p className="text-body-sm text-(--color-status-success-text)">
          Pagamento processado com segurança via Stripe
        </p>
      </div>
    </div>
  );
}
