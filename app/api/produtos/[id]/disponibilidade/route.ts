import { NextRequest, NextResponse } from "next/server";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { disponibilidadeSchema } from "@/app/lib/validation/produto";

// Prisma's Postgres driver adapter (@prisma/adapter-pg) needs a raw TCP socket
// (Node's net/tls), which the Edge runtime doesn't provide.
export const runtime = "nodejs";

export async function PATCH(
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

  const parsed = disponibilidadeSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const produtoExistente = await prisma.produto.findFirst({
    where: { id: produtoId, estabelecimentoId: session.estabelecimentoId, deletedAt: null },
    select: { id: true },
  });
  if (!produtoExistente) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Unavailable is not the same as deleted: the row stays exactly as it was,
  // only this one flag changes — it just stops being offered when a new
  // order is lançado. Orders already placed with this item are unaffected.
  const produto = await prisma.produto.update({
    where: { id: produtoId },
    data: { disponivel: parsed.data.disponivel },
    select: { id: true, disponivel: true },
  });

  return NextResponse.json({ id: produto.id, disponivel: produto.disponivel });
}
