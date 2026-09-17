import { z } from "zod";

const REQUIRED_NOME_MESSAGE = "Nome é obrigatório";
const REQUIRED_PRECO_MESSAGE = "Preço é obrigatório";
const REQUIRED_CATEGORIA_MESSAGE = "Categoria é obrigatória";

export const produtoSchema = z.object({
  nome: z
    // The `error` option covers the base type check too (missing field, wrong
    // type) — without it, an omitted field falls through to Zod's default
    // English message instead of this one.
    .string({ error: REQUIRED_NOME_MESSAGE })
    .trim()
    .min(1, { message: REQUIRED_NOME_MESSAGE })
    .max(120),
  preco: z
    .number({ error: REQUIRED_PRECO_MESSAGE })
    .positive({ message: "Preço precisa ser maior que zero" }),
  categoriaId: z.number({ error: REQUIRED_CATEGORIA_MESSAGE }).int().positive(),
  disponivel: z.boolean().optional(),
});

export type ProdutoInput = z.infer<typeof produtoSchema>;

export const disponibilidadeSchema = z.object({
  disponivel: z.boolean({ error: "Campo disponivel é obrigatório" }),
});
