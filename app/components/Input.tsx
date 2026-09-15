import { InputHTMLAttributes, forwardRef, useId } from "react";

export function getInputStateClasses(hasError = false) {
  return hasError
    ? "bg-[var(--color-bg-input)] border-[1.5px] border-[var(--color-status-danger-border)] focus:border-[var(--color-status-danger-border)]"
    : "bg-[var(--color-bg-input)] border border-[var(--color-border-default)] focus:border-[1.5px] focus:border-[var(--color-border-focus)]";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label = "Campo", error, id, className = "", disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-label-md font-semibold text-[color:var(--color-text-primary)]"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-md px-3.5 py-3 text-body-md text-[color:var(--color-text-primary)] outline-none transition-colors duration-150 motion-reduce:transition-none placeholder:text-[color:var(--color-text-tertiary)] disabled:cursor-not-allowed disabled:opacity-70 ${getInputStateClasses(!!error)} ${className}`}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-body-sm text-[color:var(--color-status-danger-text)]"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
