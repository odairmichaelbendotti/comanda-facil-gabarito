import { NextRequest, NextResponse } from "next/server";
import { StatusPedido } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { canManageOrders } from "@/app/lib/permissions";
import { decimalToString } from "@/app/lib/format";
import { statusToApi } from "@/app/lib/pedido-status";
import { pedidoCreateSchema } from "@/app/lib/validation/pedido";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }

  const { id } = await params;
  const pedidoId = Number.parseInt(id, 10);
  if (!Number.isInteger(pedidoId)) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  // A pedido from another estabelecimento must look exactly like one that
  // doesn't exist — 403 would confirm the id is real, leaking information
  // about someone else's data.
  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, estabelecimentoId: session.estabelecimentoId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      nomeGarcom: true,
      mesa: { select: { id: true, numero: true } },
      garcom: { select: { id: true, nome: true } },
      itens: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          produtoId: true,
          nomeProduto: true,
          precoUnitario: true,
          quantidade: true,
        },
      },
    },
  });
  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const itens = pedido.itens.map((item) => {
    const subtotalCentavos =
      Math.round(Number(item.precoUnitario) * 100) * item.quantidade;
    return {
      id: item.id,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      precoUnitario: decimalToString(item.precoUnitario),
      quantidade: item.quantidade,
      subtotal: (subtotalCentavos / 100).toFixed(2),
    };
  });
  const totalCentavos = pedido.itens.reduce(
    (acc, item) => acc + Math.round(Number(item.precoUnitario) * 100) * item.quantidade,
    0,
  );

  return NextResponse.json({
    id: pedido.id,
    status: statusToApi(pedido.status),
    mesa: pedido.mesa,
    // garcom continua null quando o funcionário foi excluído (hard delete) —
    // o nome congelado em nomeGarcom cobre esse caso.
    garcom: pedido.garcom ?? { id: null, nome: pedido.nomeGarcom },
    itens,
    total: (totalCentavos / 100).toFixed(2),
    createdAt: pedido.createdAt.toISOString(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }
  if (!canManageOrders(session.role)) {
    return NextResponse.json({ error: "Acesso restrito a admin/garçom" }, { status: 403 });
  }

  const { id } = await params;
  const pedidoId = Number.parseInt(id, 10);
  if (!Number.isInteger(pedidoId)) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = pedidoCreateSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const pedidoAtual = await prisma.pedido.findFirst({
    where: { id: pedidoId, estabelecimentoId: session.estabelecimentoId },
    select: { id: true, status: true },
  });
  if (!pedidoAtual) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  if (pedidoAtual.status !== StatusPedido.pendente) {
    // Depois que a cozinha começa, o pedido congela — editar o que já está
    // na chapa é o caso que este 422 existe para bloquear.
    return NextResponse.json(
      { error: "Pedido não está mais pendente" },
      { status: 422 },
    );
  }

  const mesa = await prisma.mesa.findFirst({
    where: {
      id: parsed.data.mesaId,
      estabelecimentoId: session.estabelecimentoId,
      deletedAt: null,
    },
    select: { id: true, numero: true },
  });
  if (!mesa) {
    return NextResponse.json({ error: "Mesa não encontrada" }, { status: 404 });
  }

  const produtoIds = [...new Set(parsed.data.itens.map((item) => item.produtoId))];
  const produtos = await prisma.produto.findMany({
    where: {
      id: { in: produtoIds },
      estabelecimentoId: session.estabelecimentoId,
      deletedAt: null,
    },
    select: { id: true, nome: true, preco: true, disponivel: true },
  });
  const produtoPorId = new Map(produtos.map((produto) => [produto.id, produto]));

  for (const produtoId of produtoIds) {
    if (!produtoPorId.has(produtoId)) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
  }
  const produtoIndisponivel = produtos.find((produto) => !produto.disponivel);
  if (produtoIndisponivel) {
    return NextResponse.json(
      { error: `Produto "${produtoIndisponivel.nome}" está indisponível` },
      { status: 422 },
    );
  }

  // Apaga e recria as linhas de pedido_itens numa transação — não é um
  // delta, o corpo manda a lista completa como o pedido deve ficar. Preços
  // são recongelados agora, lidos de novo em produtos.preco, nunca do corpo.
  const pedido = await prisma.$transaction(async (tx) => {
    await tx.pedidoItem.deleteMany({ where: { pedidoId } });
    return tx.pedido.update({
      where: { id: pedidoId },
      data: {
        mesaId: mesa.id,
        itens: {
          create: parsed.data.itens.map((item) => {
            const produto = produtoPorId.get(item.produtoId)!;
            return {
              produtoId: produto.id,
              nomeProduto: produto.nome,
              precoUnitario: produto.preco,
              quantidade: item.quantidade,
            };
          }),
        },
      },
      select: {
        id: true,
        status: true,
        mesa: { select: { id: true, numero: true } },
        itens: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            produtoId: true,
            nomeProduto: true,
            precoUnitario: true,
            quantidade: true,
          },
        },
      },
    });
  });

  const totalCentavos = pedido.itens.reduce(
    (acc, item) => acc + Math.round(Number(item.precoUnitario) * 100) * item.quantidade,
    0,
  );

  return NextResponse.json({
    id: pedido.id,
    status: statusToApi(pedido.status),
    mesa: pedido.mesa,
    itens: pedido.itens.map((item) => ({
      id: item.id,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      precoUnitario: decimalToString(item.precoUnitario),
      quantidade: item.quantidade,
    })),
    total: (totalCentavos / 100).toFixed(2),
  });
}
