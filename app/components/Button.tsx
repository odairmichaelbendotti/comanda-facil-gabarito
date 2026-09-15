import { ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses: Record<string, string> = {
  primary:
    "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:bg-[var(--color-status-neutral-bg)] disabled:text-[color:var(--color-text-tertiary)]",
  secondary:
    "bg-[var(--color-bg-surface-elevated)] text-[color:var(--color-text-primary)] border border-[var(--color-border-default)] hover:border-[var(--color-border-focus)] hover:text-[color:var(--color-text-brand)] disabled:bg-[var(--color-bg-surface)] disabled:border-[var(--color-border-subtle)] disabled:text-[color:var(--color-text-tertiary)]",
  ghost:
    "bg-transparent text-[color:var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:text-[color:var(--color-text-tertiary)]",
  danger:
    "bg-[var(--color-action-danger)] text-white hover:bg-[var(--color-action-danger-hover)] disabled:bg-[var(--color-status-neutral-bg)] disabled:text-[color:var(--color-text-tertiary)]",
};

const sizeClasses: Record<string, string> = {
  md: "px-5 py-3 text-button",
  sm: "px-3.5 py-2 text-body-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children = "Button",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-bold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
