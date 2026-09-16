import Button from "../../components/Button";
import DocumentTypeToggle, {
  DocumentType,
} from "../../components/DocumentTypeToggle";
import Input from "../../components/Input";
import MaskedInput from "../../components/MaskedInput";

interface LoginFormFieldsProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
  onDocumentChange: (rawValue: string) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formError: string;
  isSubmitting: boolean;
}

export default function LoginFormFields({
  documentType,
  onDocumentTypeChange,
  onDocumentChange,
  password,
  onPasswordChange,
  formError,
  isSubmitting,
}: LoginFormFieldsProps) {
  return (
    <>
      <DocumentTypeToggle value={documentType} onChange={onDocumentTypeChange} />

      <MaskedInput
        key={`document-${documentType}`}
        type={documentType}
        label="Número do Documento"
        required
        onValueChange={onDocumentChange}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="••••••••••"
        required
        value={password}
        onChange={onPasswordChange}
      />

      <p
        aria-live="polite"
        className={`-my-2 min-h-5 text-body-sm text-(--color-status-danger-text) transition-opacity duration-150 motion-reduce:transition-none ${
          formError ? "opacity-100" : "opacity-0"
        }`}
      >
        {formError || " "}
      </p>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Acessando..." : "Acessar"}
      </Button>
    </>
  );
}
