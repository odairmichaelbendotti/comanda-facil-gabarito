import { NextRequest, NextResponse } from "next/server";
import { RoleUsuario, StatusPedido } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }
  if (session.role !== RoleUsuario.admin) {
    return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  }

  const { id } = await params;
  const mesaId = Number.parseInt(id, 10);
  if (!Number.isInteger(mesaId)) {
    return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  }

  // A mesa that exists but belongs to another estabelecimento must look
  // exactly like one that doesn't exist — 403 would confirm the id is real,
  // leaking information about someone else's data.
  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, estabelecimentoId: session.estabelecimentoId, deletedAt: null },
    select: {
      id: true,
      // Counting open pedidos in the same lookup that confirms ownership —
      // one query answers "does this exist, is it mine, and can it leave".
      _count: {
        select: {
          pedidos: {
            where: { status: { in: [StatusPedido.pendente, StatusPedido.em_preparo] } },
          },
        },
      },
    },
  });
  if (!mesa) {
    return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  }

  if (mesa._count.pedidos > 0) {
    // Removing the mesa under a pedido the kitchen is actively preparing
    // would leave that pedido pointing at a table nobody can see anymore.
    // Finished/canceled pedidos don't block this — they just keep pointing
    // at the (now soft-deleted) mesa.
    return NextResponse.json({ error: "Mesa tem pedido em aberto" }, { status: 422 });
  }

  await prisma.mesa.update({
    where: { id: mesaId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
