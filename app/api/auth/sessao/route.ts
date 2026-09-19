import { NextRequest, NextResponse } from "next/server";
import { StatusAssinatura } from "@/generated/prisma/enums";
import { prisma } from "@/app/lib/prisma";
import { SESSION_COOKIE_NAME, readSessionToken } from "@/app/lib/auth/session";
import { PEDIDOS_LIMITE_GRATUITO } from "@/app/lib/plano";

// The Postgres driver adapter (@prisma/adapter-pg) needs Node's net/tls, so
// this route can't run on the Edge runtime — nothing to do with jose here,
// which works fine on Edge, but Prisma's connection does not.
export const runtime = "nodejs";

// Belt-and-suspenders: reading a cookie already makes this route dynamic in
// Next's App Router, but the business rule is explicit — a cached response
// would keep a just-deactivated account looking logged in for whoever hits
// that cache next.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function noSessionResponse() {
  // Every "not actually logged in" case — missing cookie, invalid or expired
  // token, deactivated or deleted account — returns the exact same empty 401.
  // Giving any one of them a body or a distinct shape would tempt the front
  // into branching on it, when the only correct reaction to all of them is
  // "redirect to /login".
  return new NextResponse(null, {
    status: 401,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return noSessionResponse();

  const payload = await readSessionToken(token);
  if (!payload) return noSessionResponse();

  // Reread from the database instead of trusting the token's own claims — the
  // JWT is stateless and can live for up to 30 days, so a deactivation needs
  // this query to actually take effect before the token would otherwise expire
  // on its own. Selected field by field (never the bare row) so senhaHash can
  // never end up in the response, not even by an accidental future spread.
  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      nome: true,
      role: true,
      estabelecimentoId: true,
      ativo: true,
      estabelecimento: {
        select: {
          assinatura: { select: { status: true } },
        },
      },
    },
  });

  if (!usuario || !usuario.ativo) {
    return noSessionResponse();
  }

  const premium = usuario.estabelecimento.assinatura?.status === StatusAssinatura.active;

  // Scoped to the establishment, never to the person: the quota is shared by
  // everyone who lança pedido there, not tracked per individual account.
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const pedidosUsados = await prisma.pedido.count({
    where: {
      estabelecimentoId: usuario.estabelecimentoId,
      createdAt: { gte: startOfMonth },
    },
  });

  return NextResponse.json(
    {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      estabelecimentoId: usuario.estabelecimentoId,
      plano: {
        premium,
        pedidosUsados,
        pedidosLimite: premium ? null : PEDIDOS_LIMITE_GRATUITO,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
