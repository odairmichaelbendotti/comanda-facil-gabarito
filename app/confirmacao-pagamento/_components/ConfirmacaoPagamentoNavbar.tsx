"use client";

import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Logo from "../../components/Logo";

export default function ConfirmacaoPagamentoNavbar() {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-between border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-6 py-4 sm:px-20">
      <div className="flex items-center gap-2">
        <Logo size="sm" />
        <Badge>Premium</Badge>
      </div>
      <Button variant="secondary" size="sm" onClick={() => router.push("/pedidos")}>
        <span className="flex items-center gap-1.5">
          <LuArrowLeft className="size-3.5" />
          Voltar ao Painel
        </span>
      </Button>
    </div>
  );
}
