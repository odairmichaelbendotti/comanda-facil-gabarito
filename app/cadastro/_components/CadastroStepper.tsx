interface CadastroStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export default function CadastroStepper({
  currentStep,
  totalSteps = 3,
}: CadastroStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="mb-6 flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step) => (
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
          {step < totalSteps && (
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
  );
}
