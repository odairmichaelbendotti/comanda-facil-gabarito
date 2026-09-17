import { ButtonHTMLAttributes, ReactNode } from "react";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
}

// The gold CTA used wherever the app asks someone to go (or come back) to
// Premium — PricingPlanCard's "Assinar Premium" and the cancellation page's
// "Reativar Premium" share this exact style, so it's one component instead
// of the same classes hand-copied a third time.
export default function PremiumButton({
  children = "Assinar Premium",
  className = "",
  type = "button",
  ...props
}: PremiumButtonProps) {
  return (
    <button
      type={type}
      className={`w-full cursor-pointer rounded-md bg-(--color-status-warning-text) px-5 py-2.5 text-button font-bold text-white transition-colors duration-150 motion-reduce:transition-none hover:bg-(--color-brand-accent-amber) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
