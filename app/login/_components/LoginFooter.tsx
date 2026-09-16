import Link from "next/link";

export default function LoginFooter() {
  return (
    <>
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
    </>
  );
}
