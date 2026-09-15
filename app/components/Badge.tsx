import { ReactNode } from "react";

const variantClasses: Record<string, string> = {
  neutral:
    "bg-[var(--color-status-neutral-bg)] border-[var(--color-status-neutral-border)] text-[color:var(--color-status-neutral-text)]",
  success:
    "bg-[var(--color-status-success-bg)] border-[var(--color-status-success-border)] text-[color:var(--color-status-success-text)]",
  warning:
    "bg-[var(--color-status-warning-bg)] border-[var(--color-status-warning-border)] text-[color:var(--color-status-warning-text)]",
  danger:
    "bg-[var(--color-status-danger-bg)] border-[var(--color-status-danger-border)] text-[color:var(--color-status-danger-text)]",
  info: "bg-[var(--color-status-info-bg)] border-[var(--color-status-info-border)] text-[color:var(--color-status-info-text)]",
};

interface BadgeProps {
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
  children?: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "neutral",
  children = "Badge",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-label-sm font-semibold whitespace-nowrap ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
