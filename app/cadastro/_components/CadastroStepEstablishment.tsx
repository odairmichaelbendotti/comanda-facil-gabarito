import Input from "../../components/Input";
import MaskedInput from "../../components/MaskedInput";
import NativeSelect from "../../components/NativeSelect";

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

interface CadastroStepEstablishmentProps {
  establishmentName: string;
  phone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  errors: Record<string, string>;
  cepLoading: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onPhoneChange: (rawValue: string) => void;
  onCepChange: (rawValue: string) => void;
}

export default function CadastroStepEstablishment({
  establishmentName,
  phone,
  cep,
  logradouro,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  errors,
  cepLoading,
  onChange,
  onPhoneChange,
  onCepChange,
}: CadastroStepEstablishmentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-label-md font-bold text-(--color-text-secondary)">
          3. DADOS DO ESTABELECIMENTO
        </h3>
        <div className="flex flex-col gap-3">
          <Input
            label="Nome do Estabelecimento"
            name="establishmentName"
            placeholder="Ex: Restaurante do Odair"
            value={establishmentName}
            onChange={onChange}
            error={errors.establishmentName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <MaskedInput
                type="phone"
                label="Telefone"
                name="phone"
                defaultValue={phone}
                onValueChange={onPhoneChange}
                required
              />
              {errors.phone && (
                <p className="mt-1.5 text-body-sm text-(--color-status-danger-text)">
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <MaskedInput
                type="cep"
                label="CEP"
                name="cep"
                defaultValue={cep}
                onValueChange={onCepChange}
              />
              {cepLoading && (
                <p className="mt-1.5 text-body-sm text-(--color-text-secondary)">
                  Buscando endereço...
                </p>
              )}
              {cep.length === 8 && !cepLoading && logradouro && (
                <p className="mt-1.5 text-body-sm text-(--color-status-success-text)">
                  ✓ Endereço encontrado
                </p>
              )}
            </div>
          </div>
          <Input
            label="Logradouro"
            name="logradouro"
            placeholder="Ex: Rua das Flores"
            value={logradouro}
            onChange={onChange}
            error={errors.logradouro}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Número"
              name="numero"
              placeholder="123"
              value={numero}
              onChange={onChange}
              error={errors.numero}
            />
            <Input
              label="Complemento"
              name="complemento"
              placeholder="Apt 456 (opcional)"
              value={complemento}
              onChange={onChange}
            />
          </div>
          <Input
            label="Bairro"
            name="bairro"
            placeholder="Ex: Centro"
            value={bairro}
            onChange={onChange}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Cidade"
              name="cidade"
              placeholder="São Paulo"
              value={cidade}
              onChange={onChange}
            />
            <NativeSelect
              label="Estado"
              name="estado"
              value={estado}
              onChange={onChange}
              error={errors.estado}
              placeholder="Selecione"
              options={BRAZILIAN_STATES}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
