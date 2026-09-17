import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/auth/password";
import {
  clearAttempts,
  isRateLimited,
  registerFailedAttempt,
} from "@/app/lib/auth/rate-limit";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
} from "@/app/lib/auth/session";
import { loginSchema } from "@/app/lib/validation/login";

// Neither bcryptjs nor jose actually require it — the real blocker is Prisma's
// Postgres driver adapter (@prisma/adapter-pg), which needs a raw TCP socket
// (Node's net/tls) that the Edge runtime doesn't provide.
export const runtime = "nodejs";

const INVALID_CREDENTIALS_MESSAGE = "CPF ou senha inválidos";

// A bcrypt hash with no real user behind it. Comparing against this when the
// document isn't found keeps the response time close to the "user exists,
// wrong password" path — without it, a lookup miss returns almost instantly
// while a wrong password takes ~200ms for bcrypt to compare, and that gap is
// itself enough to let an attacker enumerate which documents are registered.
const DUMMY_PASSWORD_HASH =
  "$2b$12$USW.fXSW5mlESGx7ryBmxOPNRF9WfN.Z8ReK6gI3U.MX.vjDYrs9i";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { error: firstIssue?.message ?? "Documento ou senha ausente ou fora do formato" },
      { status: 400 },
    );
  }

  const { documento, senha } = parsed.data;

  if (isRateLimited(documento)) {
    return NextResponse.json({ error: "Tentativas demais. Tente novamente mais tarde" }, {
      status: 429,
    });
  }

  // Looked up by the digit string alone, not scoped by estabelecimento: at this
  // point in the flow the tenant isn't known yet — figuring it out is the whole
  // job of this query. `documento` is globally unique across all usuarios, so
  // there is exactly one row to find, if any.
  const usuario = await prisma.usuario.findUnique({ where: { documento } });

  const senhaHash = usuario?.senhaHash ?? DUMMY_PASSWORD_HASH;
  const senhaConfere = await verifyPassword(senha, senhaHash);

  if (!usuario || !senhaConfere) {
    registerFailedAttempt(documento);
    return NextResponse.json({ error: INVALID_CREDENTIALS_MESSAGE }, { status: 401 });
  }

  if (!usuario.ativo) {
    // Correct password, but the account itself doesn't get in. This is the one
    // case where the response tells the caller more than "invalid credentials"
    // — the business rule accepts that trade-off explicitly ("mesmo com a senha
    // correta"), and it only reveals anything to someone who already knew the
    // password.
    return NextResponse.json({ error: "Conta desativada" }, { status: 403 });
  }

  clearAttempts(documento);

  const token = await createSessionToken({
    userId: usuario.id,
    role: usuario.role,
    estabelecimentoId: usuario.estabelecimentoId,
  });

  const response = NextResponse.json(
    {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role,
        estabelecimentoId: usuario.estabelecimentoId,
      },
    },
    { status: 200 },
  );
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
