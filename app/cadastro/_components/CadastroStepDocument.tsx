import DocumentTypeToggle, {
  DocumentType,
} from "../../components/DocumentTypeToggle";
import MaskedInput from "../../components/MaskedInput";

interface CadastroStepDocumentProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
  document: string;
  onDocumentChange: (rawValue: string) => void;
  error?: string;
}

export default function CadastroStepDocument({
  documentType,
  onDocumentTypeChange,
  document,
  onDocumentChange,
  error,
}: CadastroStepDocumentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-label-md font-bold text-(--color-text-secondary)">
          2. DOCUMENTO DE IDENTIFICAÇÃO
        </h3>
        <div className="flex flex-col gap-3">
          <DocumentTypeToggle value={documentType} onChange={onDocumentTypeChange} />
          <MaskedInput
            key={`document-${documentType}`}
            type={documentType}
            label="Número do Documento"
            name="document"
            defaultValue={document}
            onValueChange={onDocumentChange}
            required
          />
          {error && (
            <p className="text-body-sm text-(--color-status-danger-text)">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
