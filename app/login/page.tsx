"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentType } from "../components/DocumentTypeToggle";
import { useAuthStore } from "../lib/store/auth-store";
import LoginFooter from "./_components/LoginFooter";
import LoginFormFields from "./_components/LoginFormFields";
import LoginHeader from "./_components/LoginHeader";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [documentType, setDocumentType] = useState<DocumentType>("cpf");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function handleDocumentTypeChange(type: DocumentType) {
    setDocumentType(type);
    setDocument("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento: document, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error ||
            (documentType === "cpf" ? "CPF ou senha inválidos" : "CNPJ ou senha inválidos"),
        );
        return;
      }

      setUser({
        id: data.usuario.id,
        name: data.usuario.nome,
        role: data.usuario.role,
        estabelecimentoId: data.usuario.estabelecimentoId,
      });
      const redirectTo = searchParams.get("redirect") || "/pedidos";
      router.replace(redirectTo);
    } catch {
      setFormError("Erro ao conectar com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) px-4 py-10 sm:px-6">
      <div className="animate-fade-in-up flex w-full max-w-105 flex-col gap-5 rounded-2xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-8 shadow-lg sm:p-10">
        <LoginHeader />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LoginFormFields
            documentType={documentType}
            onDocumentTypeChange={handleDocumentTypeChange}
            onDocumentChange={setDocument}
            password={password}
            onPasswordChange={(event) => setPassword(event.target.value)}
            formError={formError}
            isSubmitting={isSubmitting}
          />
        </form>

        <LoginFooter />
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
