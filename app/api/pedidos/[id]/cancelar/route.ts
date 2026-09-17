import { NextRequest, NextResponse } from "next/server";
import { StatusPedido } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { canManageOrders } from "@/app/lib/permissions";
import { statusToApi } from "@/app/lib/pedido-status";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }
  if (!canManageOrders(session.role)) {
    // Cancelar é decisão de atendimento, não de produção — cozinha não entra
    // aqui, mesmo preparando o pedido.
    return NextResponse.json({ error: "Acesso restrito a admin/garçom" }, { status: 403 });
  }

  const { id } = await params;
  const pedidoId = Number.parseInt(id, 10);
  if (!Number.isInteger(pedidoId)) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, estabelecimentoId: session.estabelecimentoId },
    select: { id: true, status: true },
  });
  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  if (pedido.status !== StatusPedido.pendente && pedido.status !== StatusPedido.em_preparo) {
    // pronto não cancela (a comida já foi feita) e cancelado é estado final —
    // as duas situações caem no mesmo 422.
    return NextResponse.json(
      { error: "Pedido já está pronto ou cancelado" },
      { status: 422 },
    );
  }

  const atualizado = await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status: StatusPedido.cancelado },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    id: atualizado.id,
    status: statusToApi(atualizado.status),
  });
}
