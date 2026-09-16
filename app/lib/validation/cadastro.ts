import { z } from "zod";
import { TipoDocumento, UfBrasil } from "@/generated/prisma/enums";
import { isValidCnpj, isValidCpf, onlyDigits } from "../document";

// Messages are in Portuguese because they are shown to the person filling the
// form — the front renders whatever comes back in `error` without rewording it.

const digitsOnly = (label: string) =>
  z
    .string()
    .trim()
    .transform(onlyDigits)
    .refine((value) => value.length > 0, { message: `${label} é obrigatório` });

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  // An empty input is the same as "not filled in" — the form sends "" for
  // fields the person skipped, and storing empty strings as if they were data
  // makes every later read check for two kinds of absence instead of one.
  .transform((value) => (value ? value : undefined));

export const cadastroSchema = z
  .object({
    email: z.email({ message: "E-mail inválido" }).trim().toLowerCase(),
    senha: z.string().min(8, { message: "A senha precisa de ao menos 8 caracteres" }),

    tipoDocumento: z.enum(TipoDocumento, {
      message: "Tipo de documento inválido",
    }),
    documento: digitsOnly("Documento"),

    nomeEstabelecimento: z
      .string()
      .trim()
      .min(1, { message: "Nome do estabelecimento é obrigatório" })
      .max(120),

    telefone: digitsOnly("Telefone").refine(
      (value) => value.length === 10 || value.length === 11,
      { message: "Telefone inválido" },
    ),

    logradouro: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(160),
    numero: z.string().trim().min(1, { message: "Número é obrigatório" }).max(20),
    complemento: optionalText,
    bairro: optionalText,
    cidade: optionalText,
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
