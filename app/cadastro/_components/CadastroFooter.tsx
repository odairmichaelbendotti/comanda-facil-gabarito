import Link from "next/link";

export default function CadastroFooter() {
  return (
    <div className="mt-4 text-center">
      <p className="text-body-sm text-(--color-text-secondary)">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-bold text-(--color-text-brand) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-brand-primary)"
        >
          Fazer Login
        </Link>
      </p>
    </div>
  );
}
