"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import MaskedInput from "../components/MaskedInput";

// Usuário de exemplo — não há backend de autenticação ainda.
const FAKE_USER = {
  name: "Odair Michael",
  cpf: "12345678900",
  password: "123456",
};

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const isValid = cpf === FAKE_USER.cpf && password === FAKE_USER.password;
      if (isValid) {
        router.push("/pedidos");
        return;
      }
      setIsSubmitting(false);
      setFormError("CPF ou senha inválidos");
    }, 800);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) px-4 py-10 sm:px-6">
      <div className="animate-fade-in-up flex w-full max-w-100 flex-col gap-6 rounded-xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-10 shadow-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-h2 text-(--color-text-primary)">
            ComandaFácil
          </p>
          <p className="text-body-sm text-(--color-text-secondary)">
            Entre com seus dados para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <MaskedInput type="cpf" label="CPF" required onValueChange={setCpf} />

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
            className={`min-h-5 text-body-sm text-(--color-status-danger-text) transition-opacity duration-150 motion-reduce:transition-none ${
              formError ? "opacity-100" : "opacity-0"
            }`}
          >
            {formError || " "}
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Acessando..." : "Acessar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
