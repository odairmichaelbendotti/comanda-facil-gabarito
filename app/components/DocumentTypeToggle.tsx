export type DocumentType = "cpf" | "cnpj";

interface DocumentTypeToggleProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  label?: string;
}

export default function DocumentTypeToggle({
  value,
  onChange,
  label = "Tipo de Documento",
}: DocumentTypeToggleProps) {
  return (
    <div>
      <label className="mb-2 block text-label-sm font-semibold text-(--color-text-primary)">
        {label}
      </label>
      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onChange("cpf")}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
            value === "cpf"
              ? "bg-(--color-brand-primary) text-white"
              : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
          }`}
        >
          CPF
        </button>
        <button
          type="button"
          onClick={() => onChange("cnpj")}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-label-sm font-bold transition-colors duration-150 motion-reduce:transition-none ${
            value === "cnpj"
              ? "bg-(--color-brand-primary) text-white"
              : "border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-primary) hover:border-(--color-border-focus)"
          }`}
        >
          CNPJ
        </button>
      </div>
    </div>
  );
}
