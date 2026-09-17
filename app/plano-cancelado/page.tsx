"use client";

import { useRouter } from "next/navigation";
import AccountNavbar from "../components/AccountNavbar";
import Button from "../components/Button";
import PremiumButton from "../components/PremiumButton";
import ProtectedRoute from "../components/ProtectedRoute";
import SiteFooterNote from "../components/SiteFooterNote";
import TimelineCard from "./_components/TimelineCard";
import WarningHeader from "./_components/WarningHeader";

export default function PlanoCanceladoPage() {
  return (
    <ProtectedRoute>
      <PlanoCanceladoPageContent />
    </ProtectedRoute>
  );
}

function PlanoCanceladoPageContent() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center overflow-hidden bg-(--color-bg-canvas)">
      <AccountNavbar badge="Premium" />

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-4 sm:px-20">
        <WarningHeader />
        <TimelineCard />
        <div className="flex w-full max-w-120 flex-col items-center gap-2.5">
          <PremiumButton onClick={() => router.push("/premium-upgrade")}>
            Reativar Premium
          </PremiumButton>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/pedidos")}
          >
            Continuar com Plano Gratuito
          </Button>
        </div>
      </div>

      <SiteFooterNote className="shrink-0" />
    </div>
  );
}
