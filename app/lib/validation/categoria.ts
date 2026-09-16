import { z } from "zod";
import { optionalText } from "./shared";

const REQUIRED_NOME_MESSAGE = "Nome é obrigatório";

export const categoriaSchema = z.object({
  nome: z
    // The `error` option covers the base type check too (missing field, wrong
    // type) — without it, an omitted field falls through to Zod's default
    // English message instead of this one.
    .string({ error: REQUIRED_NOME_MESSAGE })
    .trim()
    .min(1, { message: REQUIRED_NOME_MESSAGE })
    .max(120),
  descricao: optionalText(500),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
