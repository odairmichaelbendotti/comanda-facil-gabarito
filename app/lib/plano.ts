import { StatusAssinatura } from "@/generated/prisma/enums";
import { prisma } from "./prisma";

// Fonte única dos limites do plano gratuito — o card "Plano Gratuito" da
// landing page (app/page.tsx) e toda checagem de cota na API precisam
// concordar com estes números.
export const PEDIDOS_LIMITE_GRATUITO = 100;
export const MESAS_LIMITE_GRATUITO = 10;

export async function isEstabelecimentoPremium(estabelecimentoId: number): Promise<boolean> {
  const assinatura = await prisma.assinatura.findUnique({
    where: { estabelecimentoId },
    select: { status: true },
  });
  return assinatura?.status === StatusAssinatura.active;
}
