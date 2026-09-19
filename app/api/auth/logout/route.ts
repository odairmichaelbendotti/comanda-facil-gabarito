import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/app/lib/auth/session";

// No Node-only API involved (no Prisma, no bcrypt, no jose verification —
// clearing a cookie doesn't require reading the token), so this can run on
// whatever runtime Next picks by default.

export async function POST() {
  const response = new NextResponse(null, { status: 204 });

  // Overwritten with the same attributes it was set with (path, sameSite,
  // secure) and an expired maxAge — a browser only clears a cookie when
  // those attributes match the one it already has; changing any of them
  // would make this silently set a second, unrelated cookie instead of
  // removing the session one.
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
