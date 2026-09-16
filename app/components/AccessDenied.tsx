import Link from "next/link";
import { LuShieldAlert } from "react-icons/lu";

interface AccessDeniedProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export default function AccessDenied({
  title = "Acesso negado",
  subtitle = "Você não tem permissão para acessar esta página.",
  backHref = "/pedidos",
  backLabel = "Voltar para Pedidos",
  className = "",
}: AccessDeniedProps) {
  return (
    <div
      className={`flex w-full flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center ${className}`}
    >
      <div className="flex size-16 items-center justify-center rounded-full border border-(--color-border-subtle) bg-(--color-bg-input) text-(--color-status-danger-text)">
        <LuShieldAlert className="size-6" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-h3 font-medium text-(--color-text-primary)">
          {title}
        </p>
        <p className="text-body-md text-(--color-text-secondary)">{subtitle}</p>
      </div>
      <Link
        href={backHref}
        className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-md bg-(--color-brand-primary) px-5 py-3 text-button font-bold text-white transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-brand-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2"
      >
        {backLabel}
      </Link>
    </div>
  );
}
