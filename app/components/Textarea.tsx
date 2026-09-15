import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { getInputStateClasses } from "./Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label = "Campo", error, id, className = "", disabled, rows = 4, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        <label
          htmlFor={textareaId}
          className="text-label-md font-semibold text-(--color-text-primary)"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`w-full resize-y rounded-md px-3.5 py-3 text-body-md text-(--color-text-primary) outline-none transition-colors duration-150 motion-reduce:transition-none placeholder:text-(--color-text-tertiary) disabled:cursor-not-allowed disabled:opacity-70 ${getInputStateClasses(!!error)} ${className}`}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-body-sm text-(--color-status-danger-text)"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default Textarea;
