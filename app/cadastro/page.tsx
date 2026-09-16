"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import MaskedInput from "../components/MaskedInput";
import NativeSelect from "../components/NativeSelect";
import { isValidCnpj, isValidCpf } from "../lib/document";

// Which formData keys each step's UI shows and validates — used to scope
// "does this step currently block advancing" to that step's own fields, so
// an unresolved error left behind on a later step (e.g. after Voltar) never
// disables the Próximo button on an earlier one.
const STEP_FIELDS: Record<number, string[]> = {
  1: ["email", "password", "confirmPassword"],
  2: ["document"],
  3: ["establishmentName", "phone", "logradouro", "numero", "estado"],
};

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

export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [documentType, setDocumentType] = useState<"cnpj" | "cpf">("cnpj");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    document: "",
    establishmentName: "",
    phone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasBlockingErrors = STEP_FIELDS[currentStep].some(
    (field) => !!errors[field],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMaskedChange =
    (field: keyof typeof formData) => (rawValue: string) => {
      setFormData((prev) => ({ ...prev, [field]: rawValue }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = "Email é obrigatório";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email inválido";
      }
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 8) {
        newErrors.password = "A senha precisa de ao menos 8 caracteres";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não conferem";
      }
    } else if (step === 2) {
      const expectedLength = documentType === "cnpj" ? 14 : 11;
      const isValid =
        formData.document.length === expectedLength &&
        (documentType === "cnpj"
          ? isValidCnpj(formData.document)
          : isValidCpf(formData.document));
      if (!isValid) {
        newErrors.document =
          documentType === "cnpj" ? "CNPJ inválido" : "CPF inválido";
      }
    } else if (step === 3) {
      if (!formData.establishmentName)
        newErrors.establishmentName = "Nome do estabelecimento é obrigatório";
      if (formData.phone.length !== 10 && formData.phone.length !== 11) {
        newErrors.phone = "Telefone inválido";
      }
      if (!formData.logradouro) newErrors.logradouro = "Endereço é obrigatório";
      if (!formData.numero) newErrors.numero = "Número é obrigatório";
      if (!formData.estado) newErrors.estado = "Estado é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Errors only ever belong to the step that produced them (via validateStep,
  // triggered by clicking Próximo/Criar Minha Conta on that step). Arriving
  // at any step — forward or back — must always start from a clean slate;
  // leftover errors from a previous attempt on a different step should never
  // be visible or count toward blocking that step's button.
  useEffect(() => {
    setErrors({});
  }, [currentStep]);

  useEffect(() => {
    if (formData.cep.length !== 8) {
      return;
    }

    const fetchCepData = async () => {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formData.cep}/json/`);
        if (!response.ok) throw new Error("Erro ao buscar CEP");

        const data = await response.json();

        if (data.erro) {
          setCepLoading(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
        setErrors((prev) => ({
          ...prev,
          logradouro: "",
          bairro: "",
          cidade: "",
          estado: "",
        }));
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setCepLoading(false);
      }
    };

    const timer = setTimeout(fetchCepData, 500);
    return () => clearTimeout(timer);
  }, [formData.cep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        email: formData.email,
        senha: formData.password,
        tipoDocumento: documentType,
        documento: formData.document,
        nomeEstabelecimento: formData.establishmentName,
        telefone: formData.phone,
        cep: formData.cep || undefined,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento || undefined,
        bairro: formData.bairro || undefined,
        cidade: formData.cidade || undefined,
        estado: formData.estado,
      };

      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || "Erro ao criar conta" });
        return;
      }

      router.push("/pedidos");
    } catch (error) {
      setErrors({ submit: "Erro ao conectar com o servidor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = {
    1: (
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
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Senha"
                name="password"
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
              />
              <Input
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    2: (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-2 text-label-md font-bold text-(--color-text-secondary)">
            2. DOCUMENTO DE IDENTIFICAÇÃO
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-2 block text-label-sm font-semibold text-(--color-text-primary)">
                Tipo de Documento
              </label>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("cnpj");
                    setFormData((prev) => ({ ...prev, document: "" }));
                  }}
                  className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
                    documentType === "cnpj"
                      ? "bg-(--color-brand-primary) text-white"
                      : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
                  }`}
                >
                  CNPJ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("cpf");
                    setFormData((prev) => ({ ...prev, document: "" }));
                  }}
                  className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
                    documentType === "cpf"
                      ? "bg-(--color-brand-primary) text-white"
                      : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
                  }`}
                >
                  CPF
                </button>
              </div>
            </div>
            <MaskedInput
              key={`document-${documentType}`}
              type={documentType}
              label="Número do Documento"
              name="document"
              defaultValue={formData.document}
              onValueChange={handleMaskedChange("document")}
              required
            />
            {errors.document && (
              <p className="text-body-sm text-(--color-status-danger-text)">
                {errors.document}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    3: (
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
              value={formData.establishmentName}
              onChange={handleInputChange}
              error={errors.establishmentName}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <MaskedInput
                  type="phone"
                  label="Telefone"
                  name="phone"
                  defaultValue={formData.phone}
                  onValueChange={handleMaskedChange("phone")}
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
                  defaultValue={formData.cep}
                  onValueChange={handleMaskedChange("cep")}
                />
                {cepLoading && (
                  <p className="mt-1.5 text-body-sm text-(--color-text-secondary)">
                    Buscando endereço...
                  </p>
                )}
                {formData.cep.length === 8 && !cepLoading && formData.logradouro && (
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
              value={formData.logradouro}
              onChange={handleInputChange}
              error={errors.logradouro}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Número"
                name="numero"
                placeholder="123"
                value={formData.numero}
                onChange={handleInputChange}
                error={errors.numero}
              />
              <Input
                label="Complemento"
                name="complemento"
                placeholder="Apt 456 (opcional)"
                value={formData.complemento}
                onChange={handleInputChange}
              />
            </div>
            <Input
              label="Bairro"
              name="bairro"
              placeholder="Ex: Centro"
              value={formData.bairro}
              onChange={handleInputChange}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Cidade"
                name="cidade"
                placeholder="São Paulo"
                value={formData.cidade}
                onChange={handleInputChange}
              />
              <NativeSelect
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                error={errors.estado}
                placeholder="Selecione"
                options={BRAZILIAN_STATES}
              />
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) px-4 py-4 sm:py-8">
      <div className="w-full max-w-135 animate-fade-in-up rounded-2xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-6 shadow-lg sm:p-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <Logo size="lg" />
          <p className="mt-1.5 text-body-sm text-(--color-text-secondary)">
            Crie a sua conta e configure seu estabelecimento em poucos minutos.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center justify-center gap-2 sm:gap-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex size-6 items-center justify-center rounded-lg text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none sm:size-8 ${
                  step <= currentStep
                    ? "bg-(--color-brand-primary) text-white"
                    : "border border-(--color-border-default) bg-(--color-bg-canvas) text-(--color-text-tertiary)"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`h-px w-6 shrink-0 transition-colors duration-150 motion-reduce:transition-none sm:w-8 ${
                    step < currentStep
                      ? "bg-(--color-brand-primary)"
                      : "bg-(--color-border-default)"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6 transition-opacity duration-150 motion-reduce:transition-none">
            {stepContent[currentStep as keyof typeof stepContent]}
          </div>

          {errors.submit && (
            <p className="mb-4 text-body-sm text-(--color-status-danger-text)">
              {errors.submit}
            </p>
          )}

          {/* Divider */}
          <div className="mb-6 h-px bg-(--color-border-subtle)" />

          {/* Form Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:flex-1"
                onClick={handlePrevious}
              >
                Voltar
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                key="next-button"
                type="button"
                variant="primary"
                className="w-full sm:flex-1"
                onClick={handleNext}
                disabled={isSubmitting || hasBlockingErrors}
              >
                Próximo
              </Button>
            ) : (
              <Button
                key="submit-button"
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting || hasBlockingErrors}
              >
                {isSubmitting ? "Criando..." : "Criar Minha Conta"}
              </Button>
            )}
          </div>

          {/* Footer */}
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
        </form>
      </div>
    </div>
  );
}
