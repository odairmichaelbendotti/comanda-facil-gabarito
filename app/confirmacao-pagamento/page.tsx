"use client";

import { useRouter } from "next/navigation";
import Button from "../components/Button";
import ProtectedRoute from "../components/ProtectedRoute";
import SiteFooterNote from "../components/SiteFooterNote";
import ConfirmacaoPagamentoNavbar from "./_components/ConfirmacaoPagamentoNavbar";
import ReceiptCard from "./_components/ReceiptCard";
import SuccessHeader from "./_components/SuccessHeader";

export default function ConfirmacaoPagamentoPage() {
  return (
    <ProtectedRoute>
      <ConfirmacaoPagamentoPageContent />
    </ProtectedRoute>
  );
}

function ConfirmacaoPagamentoPageContent() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center overflow-hidden bg-(--color-bg-canvas)">
      <ConfirmacaoPagamentoNavbar />

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-4 sm:px-20">
        <SuccessHeader />
        <ReceiptCard />
        <div className="flex w-full max-w-120 flex-col items-center gap-2.5">
          <Button className="w-full" onClick={() => router.push("/pedidos")}>
            Ir para o Painel
          </Button>
          <button
            type="button"
            onClick={() => router.push("/premium-upgrade")}
            className="cursor-pointer text-label-md font-semibold text-(--color-text-secondary) underline transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)"
          >
            Ver detalhes da assinatura
          </button>
        </div>
      </div>

      <SiteFooterNote className="shrink-0" />
    </div>
  );
}
