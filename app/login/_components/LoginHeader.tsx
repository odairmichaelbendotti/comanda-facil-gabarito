import Logo from "../../components/Logo";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Logo size="lg" />
      <p className="text-body-sm text-(--color-text-secondary)">
        Entre com seus dados para acessar sua conta
      </p>
    </div>
  );
}
