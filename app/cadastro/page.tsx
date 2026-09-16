"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentType } from "../components/DocumentTypeToggle";
import { isValidCnpj, isValidCpf } from "../lib/document";
import { useAuthStore } from "../lib/store/auth-store";
import CadastroFooter from "./_components/CadastroFooter";
import CadastroFormActions from "./_components/CadastroFormActions";
import CadastroHeader from "./_components/CadastroHeader";
import CadastroStepAccess from "./_components/CadastroStepAccess";
import CadastroStepDocument from "./_components/CadastroStepDocument";
import CadastroStepEstablishment from "./_components/CadastroStepEstablishment";
import CadastroStepper from "./_components/CadastroStepper";

// Which formData keys each step's UI shows and validates — used to scope
// "does this step currently block advancing" to that step's own fields, so
// an unresolved error left behind on a later step (e.g. after Voltar) never
// disables the Próximo button on an earlier one.
const STEP_FIELDS: Record<number, string[]> = {
  1: ["email", "password", "confirmPassword"],
  2: ["document"],
  3: ["establishmentName", "phone", "logradouro", "numero", "estado"],
};

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentType, setDocumentType] = useState<DocumentType>("cnpj");
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

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    setFormData((prev) => ({ ...prev, document: "" }));
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

  // Errors only ever belong to the step that produced them (via validateStep,
  // triggered by clicking Próximo/Criar Minha Conta on that step). Going back
  // must always start the previous step from a clean slate — a leftover
  // error from the step being left behind should never be visible or count
  // toward blocking the earlier step's button. (Going forward is already
  // clean: validateStep only lets handleNext advance once it returns {}.)
  const handlePrevious = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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

      setUser({
        id: data.usuario.id,
        name: data.usuario.nome,
        role: data.usuario.role,
        estabelecimentoId: data.usuario.estabelecimentoId,
      });
      router.push("/pedidos");
    } catch {
      setErrors({ submit: "Erro ao conectar com o servidor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) px-4 py-4 sm:py-8">
      <div className="w-full max-w-135 animate-fade-in-up rounded-2xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-6 shadow-lg sm:p-10">
        <CadastroHeader />
        <CadastroStepper currentStep={currentStep} />

        <form onSubmit={handleSubmit}>
          <div className="mb-6 transition-opacity duration-150 motion-reduce:transition-none">
            {currentStep === 1 && (
              <CadastroStepAccess
                email={formData.email}
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                errors={errors}
                onChange={handleInputChange}
              />
            )}
            {currentStep === 2 && (
              <CadastroStepDocument
                documentType={documentType}
                onDocumentTypeChange={handleDocumentTypeChange}
                document={formData.document}
                onDocumentChange={handleMaskedChange("document")}
                error={errors.document}
              />
            )}
            {currentStep === 3 && (
              <CadastroStepEstablishment
                establishmentName={formData.establishmentName}
                phone={formData.phone}
                cep={formData.cep}
                logradouro={formData.logradouro}
                numero={formData.numero}
                complemento={formData.complemento}
                bairro={formData.bairro}
                cidade={formData.cidade}
                estado={formData.estado}
                errors={errors}
                cepLoading={cepLoading}
                onChange={handleInputChange}
                onPhoneChange={handleMaskedChange("phone")}
                onCepChange={handleMaskedChange("cep")}
              />
            )}
          </div>

          {errors.submit && (
            <p className="mb-4 text-body-sm text-(--color-status-danger-text)">
              {errors.submit}
            </p>
          )}

          <div className="mb-6 h-px bg-(--color-border-subtle)" />

          <CadastroFormActions
            currentStep={currentStep}
            isSubmitting={isSubmitting}
            hasBlockingErrors={hasBlockingErrors}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <CadastroFooter />
        </form>
      </div>
    </div>
  );
}
