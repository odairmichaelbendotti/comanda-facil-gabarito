interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({
  title = "Título da página",
  subtitle = "Descrição da página",
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <h1 className="font-display text-h3 text-(--color-text-primary)">
        {title}
      </h1>
      <p className="text-body-md text-(--color-text-secondary)">{subtitle}</p>
    </div>
  );
}
