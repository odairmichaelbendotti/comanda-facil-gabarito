import Input from "../../components/Input";

interface CadastroStepAccessProps {
  email: string;
  password: string;
  confirmPassword: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CadastroStepAccess({
  email,
  password,
  confirmPassword,
  errors,
  onChange,
}: CadastroStepAccessProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-label-md font-bold text-(--color-text-secondary)">
          1. DADOS DE ACESSO
        </h3>
        <div className="flex flex-col gap-3">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Ex: contato@restaurante.com"
            value={email}
            onChange={onChange}
            error={errors.email}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={onChange}
              error={errors.password}
            />
            <Input
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={onChange}
              error={errors.confirmPassword}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
