import { z } from "zod";

const pedidoItemSchema = z.object({
  produtoId: z.number({ error: "Produto inválido" }).int().positive(),
  quantidade: z
    .number({ error: "Quantidade inválida" })
    .int({ message: "Quantidade inválida" })
    .positive({ message: "Quantidade inválida" }),
});

export const pedidoCreateSchema = z.object({
  mesaId: z.number({ error: "Mesa é obrigatória" }).int().positive(),
  itens: z
    .array(pedidoItemSchema, { error: "Lista de itens inválida" })
    .min(1, { message: "Pedido precisa de ao menos um item" }),
});

export type PedidoCreateInput = z.infer<typeof pedidoCreateSchema>;
