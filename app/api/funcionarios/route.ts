import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario, TipoDocumento } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { hashPassword } from "@/app/lib/auth/password";
import { funcionarioCreateSchema } from "@/app/lib/validation/funcionario";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
// Well above what any real equipe needs — this exists only to stop a garbage
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
  if (session.role !== RoleUsuario.admin) {
    return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);

  // Only garcom/cozinha — the admin never shows up in their own team list.
  // The screen never displayed it, and doing so would expose a delete
  // button pointed at the establishment's own owner.
  const where = {
    estabelecimentoId: session.estabelecimentoId,
    role: { in: [RoleUsuario.garcom, RoleUsuario.cozinha] },
  };

  const [total, funcionarios] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nome: true,
        documento: true,
        dataNascimento: true,
        role: true,
        telefone: true,
        ativo: true,
      },
    }),
  ]);

  return NextResponse.json({
    items: funcionarios.map((funcionario) => ({
      id: funcionario.id,
      nome: funcionario.nome,
      documento: funcionario.documento,
      dataNascimento: funcionario.dataNascimento?.toISOString().slice(0, 10),
      role: funcionario.role,
      telefone: funcionario.telefone,
      ativo: funcionario.ativo,
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

  const parsed = funcionarioCreateSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const senhaHash = await hashPassword(parsed.data.senha);

  let funcionario;
  try {
    // estabelecimentoId comes only from the token — the admin only ever
    // hires into their own restaurant.
    funcionario = await prisma.usuario.create({
      data: {
        estabelecimentoId: session.estabelecimentoId,
        nome: parsed.data.nome,
        tipoDocumento: TipoDocumento.cpf,
        documento: parsed.data.documento,
        dataNascimento: new Date(parsed.data.dataNascimento),
        role: parsed.data.role,
        senhaHash,
        telefone: parsed.data.telefone,
      },
      select: {
        id: true,
        nome: true,
        documento: true,
        dataNascimento: true,
        role: true,
        telefone: true,
        ativo: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // documento is UNIQUE globally (not per estabelecimento) — the only
      // constraint this insert can hit.
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json(
    {
      id: funcionario.id,
      nome: funcionario.nome,
      documento: funcionario.documento,
      dataNascimento: funcionario.dataNascimento?.toISOString().slice(0, 10),
      role: funcionario.role,
      telefone: funcionario.telefone,
      ativo: funcionario.ativo,
    },
    { status: 201 },
  );
}
