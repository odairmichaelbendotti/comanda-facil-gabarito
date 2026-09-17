"use client";

import AccountNavbar from "../components/AccountNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import SiteFooterNote from "../components/SiteFooterNote";
import { useAuthStore } from "../lib/store/auth-store";
import PremiumUpgradeHero from "./_components/PremiumUpgradeHero";
import PricingPlanCard from "./_components/PricingPlanCard";
import TrustSignals from "./_components/TrustSignals";

const FREE_BENEFITS = [
  "Até 30 pedidos por mês",
  "1 funcionário ativo",
  "Cardápio básico digital",
  "Suporte padrão por email",
];

const PREMIUM_BENEFITS = [
  "Pedidos ilimitados em produção",
  "Funcionários ilimitados",
  "Cardápio completo com categorias",
  "Relatórios e análises de vendas",
  "Suporte prioritário via WhatsApp 24/7",
  "Personalização avançada da marca",
];

export default function PremiumUpgradePage() {
  return (
    <ProtectedRoute>
      <PremiumUpgradePageContent />
    </ProtectedRoute>
  );
}

function PremiumUpgradePageContent() {
  const isPremium = useAuthStore((state) => state.plano?.premium ?? false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-(--color-bg-canvas)">
      <AccountNavbar />
      <PremiumUpgradeHero />

      <div className="flex w-full flex-col items-center justify-center gap-5 px-6 pt-2 pb-6 sm:flex-row sm:items-start sm:px-20">
        <PricingPlanCard
          variant="free"
          current={!isPremium}
          title="Plano Gratuito"
          description="Para estabelecimentos pequenos ou iniciando a operação digital."
          price="0"
          benefits={FREE_BENEFITS}
          actionLabel={isPremium ? "Voltar ao plano gratuito" : "Seu plano atual"}
          actionDisabled={!isPremium}
        />
        <PricingPlanCard
          variant="premium"
          current={isPremium}
          title="Plano Premium"
          description="Tudo o que seu estabelecimento precisa para operar sem limites e acelerar o atendimento."
          price="49,90"
          benefits={PREMIUM_BENEFITS}
          actionLabel={isPremium ? "Seu plano atual" : "Assinar Premium"}
          actionDisabled={isPremium}
        />
      </div>

      <TrustSignals />
      <SiteFooterNote />
    </div>
  );
}
