import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { canManageOrders } from "@/app/lib/permissions";
import { decimalToString } from "@/app/lib/format";
import { statusFromApi, statusToApi } from "@/app/lib/pedido-status";
import { pedidoCreateSchema } from "@/app/lib/validation/pedido";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
// Well above what any real salão needs — this exists only to stop a garbage
// or malicious limit value from turning into an unbounded query.
const MAX_LIMIT = 500;

// No error code is defined for a malformed page/limit — the callers that
// exist today (usePagination, useResponsiveGrid) only ever produce valid
// positive integers, so a garbage value here means something is already
// wrong upstream. Falling back to the documented default keeps the endpoint
// from crashing on it instead of inventing a 400 case nobody asked for.
function parsePositiveInt(value: string | null, fallback: number, max?: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);

  const statusParam = searchParams.get("status");
  const status = statusParam ? statusFromApi(statusParam) : undefined;
  if (statusParam && !status) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  // Scoped to the establishment only — the screen shows the whole salão to
  // every papel, there is no per-garçom filter.
  const where = {
    estabelecimentoId: session.estabelecimentoId,
    ...(status ? { status } : {}),
  };

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        createdAt: true,
        mesa: { select: { id: true, numero: true } },
        itens: {
          orderBy: { id: "asc" },
          select: { nomeProduto: true, precoUnitario: true, quantidade: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    items: pedidos.map((pedido) => {
      const totalCentavos = pedido.itens.reduce(
        (acc, item) =>
          acc + Math.round(Number(item.precoUnitario) * 100) * item.quantidade,
        0,
      );
      return {
        id: pedido.id,
        status: statusToApi(pedido.status),
        mesa: pedido.mesa,
        totalItens: pedido.itens.reduce((acc, item) => acc + item.quantidade, 0),
        resumoItens: pedido.itens
          .map((item) => `${item.quantidade}x ${item.nomeProduto}`)
          .join(", "),
        total: (totalCentavos / 100).toFixed(2),
        createdAt: pedido.createdAt.toISOString(),
      };
    }),
    page,
    limit,
    total,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }
  if (!canManageOrders(session.role)) {
    return NextResponse.json({ error: "Acesso restrito a admin/garçom" }, { status: 403 });
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

  // garcom_id vem do token, nunca do corpo — ninguém lança pedido em nome de
  // outra pessoa. O nome é copiado agora porque o funcionário pode ser
  // removido de verdade depois (hard delete), e o pedido precisa continuar
  // legível no histórico.
  const garcom = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { nome: true },
  });
  if (!garcom) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }

  const pedido = await prisma.pedido.create({
    data: {
      estabelecimentoId: session.estabelecimentoId,
      mesaId: mesa.id,
      garcomId: session.userId,
      nomeGarcom: garcom.nome,
      itens: {
        // O preço nunca vem do corpo da requisição — o servidor lê de
        // produtos.preco e congela em pedido_itens no momento da criação.
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
      createdAt: true,
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

  const totalCentavos = pedido.itens.reduce(
    (acc, item) => acc + Math.round(Number(item.precoUnitario) * 100) * item.quantidade,
    0,
  );

  return NextResponse.json(
    {
      id: pedido.id,
      status: statusToApi(pedido.status),
      mesa: pedido.mesa,
      garcom: pedido.garcom,
      itens: pedido.itens.map((item) => ({
        id: item.id,
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        precoUnitario: decimalToString(item.precoUnitario),
        quantidade: item.quantidade,
      })),
      total: (totalCentavos / 100).toFixed(2),
      createdAt: pedido.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
