import Link from "next/link";

export default function LoginFooter() {
  return (
    <p className="text-center text-body-sm text-(--color-text-secondary)">
      Não tem uma conta?{" "}
      <Link
        href="/cadastro"
        className="font-bold text-(--color-text-brand) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-brand-primary)"
      >
        Criar Conta
      </Link>
    </p>
  );
}
