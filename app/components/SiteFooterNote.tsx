interface SiteFooterNoteProps {
  className?: string;
}

export default function SiteFooterNote({ className = "" }: SiteFooterNoteProps) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-1.5 px-6 pt-2 pb-6 text-center sm:px-20 ${className}`}
    >
      <p className="text-body-sm text-(--color-text-tertiary)">
        Dúvidas? Entre em contato com nosso suporte através de{" "}
        <a
          href="mailto:suporte@comandafacil.com"
          className="text-(--color-text-brand) underline transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-brand-primary)"
        >
          suporte@comandafacil.com
        </a>
      </p>
      <p className="text-label-sm text-(--color-text-tertiary)">
        Criado por Odair Michael Bendotti · © 2026 ComandaFácil. Todos os
        direitos reservados.
      </p>
    </div>
  );
}
