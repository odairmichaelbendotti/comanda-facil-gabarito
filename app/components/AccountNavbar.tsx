"use client";

import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import Badge from "./Badge";
import Button from "./Button";
import Logo from "./Logo";

interface AccountNavbarProps {
  badge?: string;
}

// Full-page navbar shared by every standalone (non-AppShell) authenticated
// page — /premium-upgrade, /confirmacao-pagamento, /plano-cancelado — that
// only ever needs the logo, an optional plan badge, and a way back to the
// app.
export default function AccountNavbar({ badge }: AccountNavbarProps) {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-between border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-6 py-4 sm:px-20">
      <div className="flex items-center gap-2">
        <Logo size="sm" />
        {badge && <Badge>{badge}</Badge>}
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
