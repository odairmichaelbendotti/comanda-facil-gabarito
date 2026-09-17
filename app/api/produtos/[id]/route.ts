import { NextRequest, NextResponse } from "next/server";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { decimalToString } from "@/app/lib/format";
import { produtoSchema } from "@/app/lib/validation/produto";

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

  const { id } = await params;
  const produtoId = Number.parseInt(id, 10);
  if (!Number.isInteger(produtoId)) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
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

  // A product that exists but belongs to another estabelecimento must look
  // exactly like one that doesn't exist — 403 would confirm the id is real,
  // leaking information about someone else's data.
  const produtoExistente = await prisma.produto.findFirst({
    where: { id: produtoId, estabelecimentoId: session.estabelecimentoId, deletedAt: null },
    select: { id: true },
  });
  if (!produtoExistente) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // The new categoria also needs to be from the same estabelecimento.
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

  const produto = await prisma.produto.update({
    where: { id: produtoId },
    data: {
      nome: parsed.data.nome,
      // Changing the price never touches past orders — pedido_itens copies
      // preco_unitario at the moment of sale, which is what keeps the
      // historical record honest even after this update.
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

  return NextResponse.json({
    id: produto.id,
    nome: produto.nome,
    preco: decimalToString(produto.preco),
    disponivel: produto.disponivel,
    categoria: produto.categoria,
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
  const produtoId = Number.parseInt(id, 10);
  if (!Number.isInteger(produtoId)) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, estabelecimentoId: session.estabelecimentoId, deletedAt: null },
    select: { id: true },
  });
  if (!produto) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Unlike categoria, there's no block here: a product still referenced by
  // past orders can leave the cardápio at any time — pedido_itens.produtoId
  // is ON DELETE SET NULL and nome_produto/preco_unitario are already frozen,
  // so old orders keep showing the item normally.
  await prisma.produto.update({
    where: { id: produtoId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
