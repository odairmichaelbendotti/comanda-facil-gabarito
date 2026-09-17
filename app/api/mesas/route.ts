import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { mesaSchema } from "@/app/lib/validation/mesa";

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

  // Scoped to the token's estabelecimento and excluding soft-deleted rows —
  // both conditions apply to every listing in this project, not just this one.
  const where = {
    estabelecimentoId: session.estabelecimentoId,
    deletedAt: null,
  };

  const [total, mesas] = await Promise.all([
    prisma.mesa.count({ where }),
    prisma.mesa.findMany({
      where,
      // Ascending by numero, not id — that's the order the grade and the
      // "Selecionar Mesa" select both expect.
      orderBy: { numero: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, numero: true },
    }),
  ]);

  return NextResponse.json({ items: mesas, page, limit, total });
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

  const parsed = mesaSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  let mesa;
  try {
    // estabelecimentoId comes only from the token, never from the request
    // body — same rule as every other create endpoint in this plan.
    mesa = await prisma.mesa.create({
      data: {
        estabelecimentoId: session.estabelecimentoId,
        numero: parsed.data.numero,
      },
      select: { id: true, numero: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // The only unique constraint this insert can hit is the partial index
      // mesas_estabelecimento_numero_ativa (estabelecimento_id, numero WHERE
      // deleted_at IS NULL) — there's nothing else to disambiguate here.
      return NextResponse.json(
        { error: "Já existe mesa ativa com esse número" },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json(mesa, { status: 201 });
}
