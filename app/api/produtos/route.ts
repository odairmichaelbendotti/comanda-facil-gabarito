import { NextRequest, NextResponse } from "next/server";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { decimalToString } from "@/app/lib/format";
import { produtoSchema } from "@/app/lib/validation/produto";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
// Well above what any real cardápio needs — this exists only to stop a
// garbage or malicious limit value from turning into an unbounded query.
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

  const categoriaIdParam = searchParams.get("categoriaId");
  const categoriaId = categoriaIdParam ? Number.parseInt(categoriaIdParam, 10) : undefined;

  const disponivelParam = searchParams.get("disponivel");
  const disponivel =
    disponivelParam === "true" ? true : disponivelParam === "false" ? false : undefined;

  // Scoped to the token's estabelecimento and excluding soft-deleted rows —
  // both conditions apply to every listing in this project, not just this one.
  const where = {
    estabelecimentoId: session.estabelecimentoId,
    deletedAt: null,
    ...(Number.isInteger(categoriaId) ? { categoriaId } : {}),
    ...(disponivel !== undefined ? { disponivel } : {}),
  };

  const [total, produtos] = await Promise.all([
    prisma.produto.count({ where }),
    prisma.produto.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nome: true,
        preco: true,
        disponivel: true,
        // The "Categoria" column shows data from another entity — it's an
        // include, not a column, same reasoning as categorias' totalProdutos.
        categoria: { select: { id: true, nome: true } },
      },
    }),
  ]);

  return NextResponse.json({
    items: produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      preco: decimalToString(produto.preco),
      disponivel: produto.disponivel,
      categoria: produto.categoria,
    })),
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
  if (session.role !== RoleUsuario.admin) {
    return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = produtoSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  // The categoria must belong to the same estabelecimento as the token —
  // without this check, sending an arbitrary id would let anyone hang a
  // product off a category that belongs to a different restaurant.
  const categoria = await prisma.categoria.findFirst({
    where: {
      id: parsed.data.categoriaId,
      estabelecimentoId: session.estabelecimentoId,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (!categoria) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const produto = await prisma.produto.create({
    data: {
      estabelecimentoId: session.estabelecimentoId,
      nome: parsed.data.nome,
      preco: parsed.data.preco,
      categoriaId: parsed.data.categoriaId,
      disponivel: parsed.data.disponivel,
    },
    select: {
      id: true,
      nome: true,
      preco: true,
      disponivel: true,
      categoria: { select: { id: true, nome: true } },
    },
  });

  return NextResponse.json(
    {
      id: produto.id,
      nome: produto.nome,
      preco: decimalToString(produto.preco),
      disponivel: produto.disponivel,
      categoria: produto.categoria,
    },
    { status: 201 },
  );
}
