import { z } from "zod";
import { onlyDigits } from "../document";

// Deliberately loose compared to cadastroSchema: the API looks up by the digit
// string alone (see route.ts), not by declared type, so this only needs to
// reject something that could never be a CPF or CNPJ — not tell the two apart.
const REQUIRED_MESSAGE = "Documento ou senha ausente ou fora do formato";

export const loginSchema = z.object({
  documento: z
    // The `error` option also covers the base type check (missing field, wrong
    // type) — without it, an omitted field falls through to Zod's default
    // English message instead of this one.
    .string({ error: REQUIRED_MESSAGE })
    .trim()
    .transform(onlyDigits)
    .refine((value) => value.length === 11 || value.length === 14, {
      message: REQUIRED_MESSAGE,
    }),
  senha: z.string({ error: REQUIRED_MESSAGE }).min(1, { message: REQUIRED_MESSAGE }),
});

export type LoginInput = z.infer<typeof loginSchema>;
