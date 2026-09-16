import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { categoriaSchema } from "@/app/lib/validation/categoria";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
// Well above what any real cardápio needs (a restaurant realistically has a
// few dozen categories at most) — this exists only to stop a garbage or
// malicious limit value from turning into an unbounded query, not to get in
// the way of the modals that intentionally ask for "all of them".
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

  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(
    request.nextUrl.searchParams.get("limit"),
    DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  // Scoped to the token's estabelecimento and excluding soft-deleted rows —
  // both conditions apply to every listing in this project, not just this one.
  const where = {
    estabelecimentoId: session.estabelecimentoId,
    deletedAt: null,
  };

  const [total, categorias] = await Promise.all([
    prisma.categoria.count({ where }),
    prisma.categoria.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nome: true,
        descricao: true,
        // Filtered relation count: only products that are still active count
        // toward the subtitle CategoryCard shows — a deleted product
        // shouldn't make a category look busier than it actually is.
        _count: {
          select: {
            produtos: { where: { deletedAt: null } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    items: categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      totalProdutos: categoria._count.produtos,
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

  const parsed = categoriaSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  let categoria;
  try {
    // estabelecimentoId comes only from the token, never from the request
    // body — accepting it from the body would let anyone create a category
    // inside a restaurant that isn't theirs.
    categoria = await prisma.categoria.create({
      data: {
        estabelecimentoId: session.estabelecimentoId,
        nome: parsed.data.nome,
        descricao: parsed.data.descricao,
      },
      select: { id: true, nome: true, descricao: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // The only unique constraint this insert can hit is the partial index
      // categorias_estabelecimento_nome_ativa (estabelecimento_id, nome WHERE
      // deleted_at IS NULL) — unlike cadastro's two possible constraints,
      // there's nothing else to disambiguate here.
      return NextResponse.json(
        { error: "Já existe uma categoria ativa com esse nome" },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json(
    {
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      // A category is always created empty — this is a count of products,
      // not a stored column, so a brand new row is 0 without needing a query.
      totalProdutos: 0,
    },
    { status: 201 },
  );
}
