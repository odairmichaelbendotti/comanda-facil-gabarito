import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario, TipoDocumento } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { getSessionFromRequest } from "@/app/lib/auth/session";
import { hashPassword } from "@/app/lib/auth/password";
import { funcionarioUpdateSchema } from "@/app/lib/validation/funcionario";

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
  const funcionarioId = Number.parseInt(id, 10);
  if (!Number.isInteger(funcionarioId)) {
    return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = funcionarioUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  // A funcionário from another estabelecimento must look exactly like one
  // that doesn't exist — 403 would confirm the id is real, leaking
  // information about someone else's data.
  const alvo = await prisma.usuario.findFirst({
    where: { id: funcionarioId, estabelecimentoId: session.estabelecimentoId },
    select: { id: true, role: true },
  });
  if (!alvo) {
    return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
  }
  if (alvo.role === RoleUsuario.admin) {
    // The plan is explicit here: this is 403, not 404 — an admin editing
    // another admin (of the same estabelecimento, one that shouldn't even
    // exist normally) or rebadging themselves through this route is a
    // privilege operation this endpoint refuses, not a lookup miss.
    return NextResponse.json(
      { error: "Não é possível editar o administrador por esta rota" },
      { status: 403 },
    );
  }

  const senhaHash = parsed.data.senha ? await hashPassword(parsed.data.senha) : undefined;

  let funcionario;
  try {
    funcionario = await prisma.usuario.update({
      where: { id: funcionarioId },
      data: {
        nome: parsed.data.nome,
        tipoDocumento: TipoDocumento.cpf,
        documento: parsed.data.documento,
        dataNascimento: new Date(parsed.data.dataNascimento),
        role: parsed.data.role,
        // Absent password never touches senha_hash — Prisma simply skips a
        // key whose value is undefined instead of writing it.
        senhaHash,
        ativo: parsed.data.ativo,
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
      // documento is UNIQUE globally — the only constraint this update can
      // hit is another person already using that CPF.
      return NextResponse.json({ error: "CPF já usado por outra pessoa" }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({
    id: funcionario.id,
    nome: funcionario.nome,
    documento: funcionario.documento,
    dataNascimento: funcionario.dataNascimento?.toISOString().slice(0, 10),
    role: funcionario.role,
    telefone: funcionario.telefone,
    ativo: funcionario.ativo,
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
  const funcionarioId = Number.parseInt(id, 10);
  if (!Number.isInteger(funcionarioId)) {
    return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
  }

  const alvo = await prisma.usuario.findFirst({
    where: { id: funcionarioId, estabelecimentoId: session.estabelecimentoId },
    select: { id: true, role: true },
  });
  if (!alvo) {
    return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
  }
  if (alvo.role === RoleUsuario.admin) {
    // The admin can't delete themselves or another admin — the
    // estabelecimento would be left without an owner and nobody to manage it.
    return NextResponse.json(
      { error: "Não é possível excluir o administrador" },
      { status: 403 },
    );
  }

  // Real deletion: pedidos.garcom_id is nullable with onDelete: SetNull (and
  // pedidos.nome_garcom already froze this person's name at order time), so
  // removing the row doesn't break any pedido history. This also frees up
  // the CPF — documento is UNIQUE globally — so the same person can be
  // rehired later as a brand-new row instead of needing a reactivation flow.
  await prisma.usuario.delete({
    where: { id: funcionarioId },
  });

  return new NextResponse(null, { status: 204 });
}
