import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { categoriaSchema } from "@/app/lib/validation/categoria";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

export async function PUT(
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

  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
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
    // Scoped to estabelecimentoId (never trusted from the URL alone) and to
    // deletedAt: null in the same query — updateMany rather than update so a
    // category belonging to another estabelecimento, or a soft-deleted one,
    // fails as "0 rows touched" instead of leaking which ids exist elsewhere.
    const { count } = await prisma.categoria.updateMany({
      where: { id, estabelecimentoId: session.estabelecimentoId, deletedAt: null },
      data: { nome: parsed.data.nome, descricao: parsed.data.descricao },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    categoria = await prisma.categoria.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        _count: { select: { produtos: { where: { deletedAt: null } } } },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Same partial unique index POST can hit (categorias_estabelecimento_nome_ativa)
      // — renaming into another active category's name in this estabelecimento.
      return NextResponse.json(
        { error: "Já existe uma categoria ativa com esse nome" },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json({
    id: categoria.id,
    nome: categoria.nome,
    descricao: categoria.descricao,
    totalProdutos: categoria._count.produtos,
  });
}

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
  const categoriaId = Number.parseInt(id, 10);
  if (!Number.isInteger(categoriaId)) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  // Scoped by estabelecimento and already-excluded categories both folded
  // into the same lookup that also brings the active-product count — one
  // query answers "does this exist, is it mine, and can it leave" at once.
  const categoria = await prisma.categoria.findFirst({
    where: {
      id: categoriaId,
      estabelecimentoId: session.estabelecimentoId,
      deletedAt: null,
    },
    select: {
      id: true,
      _count: {
        select: { produtos: { where: { deletedAt: null } } },
      },
    },
  });

  // A category that exists but belongs to another estabelecimento must look
  // exactly like one that doesn't exist. Answering 403 here would confirm the
  // id is real, leaking information about someone else's data.
  if (!categoria) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  if (categoria._count.produtos > 0) {
    // produtos.categoria_id has onDelete: Restrict, but that constraint only
    // fires on an actual DELETE — this is a soft delete (an UPDATE setting
    // deleted_at), which the database would happily allow even with active
    // products still pointing here. Without this check, those products would
    // be left referencing a category that no longer shows up anywhere.
    return NextResponse.json(
      { error: "Ainda há produtos ativos nessa categoria" },
      { status: 422 },
    );
  }

  await prisma.categoria.update({
    where: { id: categoriaId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
