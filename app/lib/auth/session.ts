import { SignJWT, jwtVerify } from "jose";
import type { RoleUsuario } from "@/generated/prisma/client";

export const SESSION_COOKIE_NAME = "comanda-facil-session";

// 30 days, as agreed for the signup cookie. Kept in seconds because that is what
// the cookie's maxAge expects; the JWT expiration is derived from it so the token
// and the cookie can never disagree about when the session ends.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface SessionPayload {
  userId: number;
  role: RoleUsuario;
  estabelecimentoId: number;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Failing loudly at startup beats signing tokens with a fallback secret —
    // a predictable key lets anyone forge a session for any establishment.
    throw new Error("AUTH_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({
    role: payload.role,
    estabelecimentoId: payload.estabelecimentoId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) return null;
    return {
      userId,
      role: payload.role as RoleUsuario,
      estabelecimentoId: payload.estabelecimentoId as number,
    };
  } catch {
    // Expired, tampered with, or signed by a different secret — all of these
    // mean "no session", and none of them should leak a reason to the caller.
    return null;
  }
}

// Options shared by every place that writes this cookie. httpOnly is the point:
// the page's JavaScript can't read the token, so an XSS can't walk off with it.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
