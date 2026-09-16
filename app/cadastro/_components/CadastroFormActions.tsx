import Button from "../../components/Button";

interface CadastroFormActionsProps {
  currentStep: number;
  totalSteps?: number;
  isSubmitting: boolean;
  hasBlockingErrors: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function CadastroFormActions({
  currentStep,
  totalSteps = 3,
  isSubmitting,
  hasBlockingErrors,
  onPrevious,
  onNext,
}: CadastroFormActionsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={onPrevious}
        >
          Voltar
        </Button>
      )}
      {currentStep < totalSteps ? (
        // A distinct `key` here is load-bearing, not cosmetic: this button and
        // the submit one below sit at the same tree position. Without
        // different keys, React reconciles them as the same DOM node and just
        // flips its `type` attribute in place instead of remounting — which
        // means a single click both advances the step (via onNext, handled
        // here) AND, because the browser evaluates the click's default action
        // against the button's now-current `type="submit"`, submits the form
        // immediately, before the next step's fields are ever shown. See the
        // "Step 3 self-submitting the instant it's reached" fix.
        <Button
          key="next-button"
          type="button"
          variant="primary"
          className="w-full sm:flex-1"
          onClick={onNext}
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
  );
}
