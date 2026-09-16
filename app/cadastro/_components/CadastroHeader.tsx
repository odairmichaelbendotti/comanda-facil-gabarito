import Logo from "../../components/Logo";

export default function CadastroHeader() {
  return (
    <div className="mb-6 text-center">
      <Logo size="lg" />
      <p className="mt-1.5 text-body-sm text-(--color-text-secondary)">
        Crie a sua conta e configure seu estabelecimento em poucos minutos.
      </p>
    </div>
  );
}
