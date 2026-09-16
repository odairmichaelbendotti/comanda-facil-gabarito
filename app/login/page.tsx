"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import MaskedInput from "../components/MaskedInput";
import { useAuthStore } from "../lib/store/auth-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const user = login(document, password);
      if (user) {
        const redirectTo = searchParams.get("redirect") || "/pedidos";
        router.replace(redirectTo);
        return;
      }
      setIsSubmitting(false);
      setFormError(
        documentType === "cpf" ? "CPF ou senha inválidos" : "CNPJ ou senha inválidos",
      );
    }, 800);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) px-4 py-10 sm:px-6">
      <div className="animate-fade-in-up flex w-full max-w-105 flex-col gap-5 rounded-2xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-8 shadow-lg sm:p-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          <p className="text-body-sm text-(--color-text-secondary)">
            Entre com seus dados para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-label-sm font-semibold text-(--color-text-primary)">
              Tipo de Documento
            </label>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setDocumentType("cpf");
                  setDocument("");
                }}
                className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
                  documentType === "cpf"
                    ? "bg-(--color-brand-primary) text-white"
                    : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
                }`}
              >
                CPF
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocumentType("cnpj");
                  setDocument("");
                }}
                className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
                  documentType === "cnpj"
                    ? "bg-(--color-brand-primary) text-white"
                    : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
                }`}
              >
                CNPJ
              </button>
            </div>
          </div>

          <MaskedInput
            key={`document-${documentType}`}
            type={documentType}
            label="Número do Documento"
            required
            onValueChange={setDocument}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••••"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <p
            aria-live="polite"
            className={`-my-2 min-h-5 text-body-sm text-(--color-status-danger-text) transition-opacity duration-150 motion-reduce:transition-none ${
              formError ? "opacity-100" : "opacity-0"
            }`}
          >
            {formError || " "}
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Acessando..." : "Acessar"}
          </Button>
        </form>

        <p className="text-center text-body-sm text-(--color-text-secondary)">
          Não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-(--color-text-brand) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-brand-primary)"
          >
            Criar Conta
          </Link>
        </p>

        <p className="text-center text-body-sm text-(--color-text-tertiary)">
          Contas de teste (senha 123456): 123.456.789-00 (admin),
          987.654.321-00 (garçom), 111.222.333-44 (cozinha)
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
