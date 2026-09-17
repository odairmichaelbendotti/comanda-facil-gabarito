import { z } from "zod";

export const mesaSchema = z.object({
  numero: z
    // The `error` option covers the base type check too (missing field, wrong
    // type) — without it, an omitted field falls through to Zod's default
    // English message instead of this one.
    .number({ error: "Número é obrigatório" })
    .int()
    .positive({ message: "Número precisa ser maior que zero" }),
});

export type MesaInput = z.infer<typeof mesaSchema>;
