import { z } from "zod";
import { RoleUsuario } from "@/generated/prisma/enums";
import { isValidCpf, onlyDigits } from "../document";

// Only the two roles the /funcionarios screen's role buttons can produce —
// accepting "admin" here would let a request escalate a hire to owner.
const funcionarioRole = z.enum([RoleUsuario.garcom, RoleUsuario.cozinha], {
  error: "Função inválida",
});

const documentoCpf = z
  // The `error` option covers the base type check too (missing field, wrong
  // type) — without it, an omitted field falls through to Zod's default
  // English message instead of this one.
  .string({ error: "CPF inválido" })
  .trim()
  .transform(onlyDigits)
  .refine((value) => value.length === 11 && isValidCpf(value), {
    message: "CPF inválido",
  });

export const funcionarioCreateSchema = z.object({
  nome: z.string({ error: "Nome é obrigatório" }).trim().min(1, { message: "Nome é obrigatório" }).max(120),
  documento: documentoCpf,
  dataNascimento: z.iso.date({ error: "Data de nascimento inválida" }),
  role: funcionarioRole,
  senha: z.string({ error: "Senha é obrigatória" }).min(1, { message: "Senha é obrigatória" }),
  telefone: z
    .string()
    .trim()
    .transform(onlyDigits)
    .refine((value) => value === "" || value.length === 10 || value.length === 11, {
      message: "Telefone inválido",
    })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export type FuncionarioCreateInput = z.infer<typeof funcionarioCreateSchema>;

export const funcionarioUpdateSchema = z.object({
  nome: z.string({ error: "Nome é obrigatório" }).trim().min(1, { message: "Nome é obrigatório" }).max(120),
  documento: documentoCpf,
  dataNascimento: z.iso.date({ error: "Data de nascimento inválida" }),
  role: funcionarioRole,
  // Absent or empty means "keep the current password" — the modal's own
  // placeholder says so ("Deixe em branco para manter a atual").
  senha: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  ativo: z.boolean().optional(),
});

export type FuncionarioUpdateInput = z.infer<typeof funcionarioUpdateSchema>;
