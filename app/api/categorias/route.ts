import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { categoriaSchema } from "@/app/lib/validation/categoria";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

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
