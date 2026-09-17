import { z } from "zod";
import { TipoDocumento, UfBrasil } from "@/generated/prisma/enums";
import { isValidCnpj, isValidCpf, onlyDigits } from "../document";
import { optionalText } from "./shared";

// Messages are in Portuguese because they are shown to the person filling the
// form — the front renders whatever comes back in `error` without rewording it.

const digitsOnly = (label: string) =>
  z
    // The `error` option here also covers the base type check (missing field,
    // wrong type) — without it, a request that omits the field entirely falls
    // through to Zod's default English message instead of this one.
    .string({ error: `${label} é obrigatório` })
    .trim()
    .transform(onlyDigits)
    .refine((value) => value.length > 0, { message: `${label} é obrigatório` });

export const cadastroSchema = z
  .object({
    email: z.email({ message: "E-mail inválido" }).trim().toLowerCase(),
    senha: z
      .string({ error: "A senha precisa de ao menos 8 caracteres" })
      .min(8, { message: "A senha precisa de ao menos 8 caracteres" }),

    tipoDocumento: z.enum(TipoDocumento, {
      message: "Tipo de documento inválido",
    }),
    documento: digitsOnly("Documento"),

    nomeEstabelecimento: z
      .string({ error: "Nome do estabelecimento é obrigatório" })
      .trim()
      .min(1, { message: "Nome do estabelecimento é obrigatório" })
      .max(120),

    telefone: digitsOnly("Telefone").refine(
      (value) => value.length === 10 || value.length === 11,
      { message: "Telefone inválido" },
    ),

    logradouro: z
      .string({ error: "Endereço é obrigatório" })
      .trim()
      .min(1, { message: "Endereço é obrigatório" })
      .max(160),
    numero: z
      .string({ error: "Número é obrigatório" })
      .trim()
      .min(1, { message: "Número é obrigatório" })
      .max(20),
    complemento: optionalText(120),
    bairro: optionalText(120),
    cidade: optionalText(120),
    estado: z.enum(UfBrasil, { message: "Estado inválido" }),

    cep: z
      .string()
      .trim()
      .transform(onlyDigits)
      .refine((value) => value === "" || value.length === 8, {
        message: "CEP inválido",
      })
      .transform((value) => (value === "" ? undefined : value))
      .optional(),
  })
  // The document check depends on two fields at once, so it can't live on either
  // one alone: 11 digits is only valid when the person picked CPF, and 14 only
  // when they picked CNPJ.
  .superRefine((data, ctx) => {
    const isCpf = data.tipoDocumento === TipoDocumento.cpf;
    const expectedLength = isCpf ? 11 : 14;
    const label = isCpf ? "CPF" : "CNPJ";

    if (data.documento.length !== expectedLength) {
      ctx.addIssue({
        code: "custom",
        path: ["documento"],
        message: `${label} inválido`,
      });
      return;
    }

    const valid = isCpf ? isValidCpf(data.documento) : isValidCnpj(data.documento);
    if (!valid) {
      ctx.addIssue({
        code: "custom",
        path: ["documento"],
        message: `${label} inválido`,
      });
    }
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;
