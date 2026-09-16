import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { RoleUsuario } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/auth/password";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/app/lib/auth/session";
import { cadastroSchema } from "@/app/lib/validation/cadastro";

// bcrypt and jose both need Node APIs, so this route can't run on the Edge runtime.
export const runtime = "nodejs";

// Prisma 7's driver-adapter clients (PrismaPg here) don't populate the classic
// `error.meta.target` array for a unique-constraint violation — the underlying
// Postgres constraint name is nested instead, under `driverAdapterError`. This
// walks both shapes so the message stays correct whether or not a future
// Prisma upgrade changes which one is populated.
function uniqueConstraintTargetsEmail(
  error: Prisma.PrismaClientKnownRequestError,
): boolean {
  const meta = error.meta as Record<string, unknown> | undefined;
  const target = meta?.target;
  if (Array.isArray(target) && target.some((field) => String(field).includes("email"))) {
    return true;
  }

  const driverAdapterError = meta?.driverAdapterError as
    | { cause?: { constraint?: { index?: string }; originalMessage?: string } }
    | undefined;
  const constraintName = driverAdapterError?.cause?.constraint?.index ?? "";
  const originalMessage = driverAdapterError?.cause?.originalMessage ?? "";
  return constraintName.includes("email") || originalMessage.includes("email");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = cadastroSchema.safeParse(body);
  if (!parsed.success) {
    // Surface the first message only. The form validates field by field before
    // submitting, so anything reaching here is a single unexpected problem —
    // a wall of issues would be noise for the person reading it.
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const senhaHash = await hashPassword(data.senha);

  let usuario;
  try {
    // One transaction for both rows: an establishment without its owner is
    // unreachable — nobody could ever log into it — so a half-finished signup
    // is worse than no signup at all.
    usuario = await prisma.$transaction(async (tx) => {
      const estabelecimento = await tx.estabelecimento.create({
        data: {
          nome: data.nomeEstabelecimento,
          tipoDocumento: data.tipoDocumento,
          documento: data.documento,
          telefone: data.telefone,
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
        },
      });

      return tx.usuario.create({
        data: {
          estabelecimentoId: estabelecimento.id,
          // The signup form never asks for a person's name, only the
          // establishment's — so that is what identifies the owner until they
          // can edit it.
          nome: data.nomeEstabelecimento,
          tipoDocumento: data.tipoDocumento,
          documento: data.documento,
          senhaHash,
          role: RoleUsuario.admin,
          email: data.email,
          telefone: data.telefone,
        },
        select: { id: true, nome: true, role: true, estabelecimentoId: true },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: uniqueConstraintTargetsEmail(error)
            ? "Este e-mail já está cadastrado"
            : "Este documento já está cadastrado",
        },
        { status: 409 },
      );
    }
    throw error;
  }

  const token = await createSessionToken({
    userId: usuario.id,
    role: usuario.role,
    estabelecimentoId: usuario.estabelecimentoId,
  });

  const response = NextResponse.json({ usuario }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
