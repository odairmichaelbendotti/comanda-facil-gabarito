import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { LuChevronDown } from "react-icons/lu";
import { getInputStateClasses } from "./Input";

interface NativeSelectOption {
  value: string;
  label: string;
}

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: NativeSelectOption[];
  placeholder?: string;
  error?: string;
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect(
    { label = "Campo", options, placeholder = "Selecionar...", error, id, className = "", disabled, ...props },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        <label
          htmlFor={selectId}
          className="text-label-md font-semibold text-(--color-text-primary)"
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={`w-full cursor-pointer appearance-none rounded-md px-3.5 py-3 pr-10 text-body-md text-(--color-text-primary) outline-none transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-70 ${getInputStateClasses(!!error)} ${className}`}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LuChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-(--color-text-secondary)" />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="text-body-sm text-(--color-status-danger-text)"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default NativeSelect;
