"use client";

import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import Button from "../../components/Button";
import Logo from "../../components/Logo";

export default function PremiumUpgradeNavbar() {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-between border-b border-(--color-border-subtle) px-6 py-6 sm:px-20">
      <Logo size="lg" />
      <Button variant="secondary" onClick={() => router.push("/pedidos")}>
        <span className="flex items-center gap-2">
          <LuArrowLeft className="size-3.5" />
          Voltar ao Painel
        </span>
      </Button>
    </div>
  );
}
