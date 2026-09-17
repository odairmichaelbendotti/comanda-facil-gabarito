import "dotenv/config";
import { defineConfig } from "prisma/config";

// `datasource` is only required for migrate/introspect, not for `generate`
// (which only reads the schema) — and `generate` is exactly what runs from
// `postinstall` on a host like Vercel, whose install step doesn't always
// have DATABASE_URL available yet. `env("DATABASE_URL")` throws immediately
// at config-load time if the var is unset, which would fail `generate` too
// even though it never needs a real connection. Omitting `datasource`
// entirely when the var isn't set avoids that; a migrate/introspect command
// run without it still fails, just with Prisma's own clear "no datasource"
// error instead of this file's.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
