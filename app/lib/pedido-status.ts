import { StatusPedido } from "@/generated/prisma/enums";

// The UI's OrderStatus type (app/pedidos/_components/PedidosGrid.tsx) spells
// "em-preparo" with a hyphen; Prisma's enum member is "em_preparo" (the
// hyphen only survives as the @map'd column value, never as the JS-side
// string). Every pedidos endpoint needs to translate between the two.
const API_TO_ENUM: Record<string, StatusPedido> = {
  pendente: StatusPedido.pendente,
  "em-preparo": StatusPedido.em_preparo,
  pronto: StatusPedido.pronto,
  cancelado: StatusPedido.cancelado,
};

const ENUM_TO_API: Record<StatusPedido, string> = {
  [StatusPedido.pendente]: "pendente",
  [StatusPedido.em_preparo]: "em-preparo",
  [StatusPedido.pronto]: "pronto",
  [StatusPedido.cancelado]: "cancelado",
};

export function statusFromApi(value: string): StatusPedido | undefined {
  return API_TO_ENUM[value];
}

export function statusToApi(value: StatusPedido): string {
  return ENUM_TO_API[value];
}
