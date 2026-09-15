import { ReactNode } from "react";
import Link from "next/link";

interface SidebarNavItemProps {
  icon: ReactNode;
  label?: string;
  href: string;
  active?: boolean;
  className?: string;
}

export default function SidebarNavItem({
  icon,
  label = "Item",
  href,
  active = false,
  className = "",
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3.5 py-2.5 text-body-md font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] ${
        active
          ? "bg-[var(--color-brand-primary)] text-white"
          : "text-[color:var(--color-text-secondary)] hover:bg-[var(--color-bg-input)] hover:text-[color:var(--color-text-primary)]"
      } ${className}`}
    >
      <span className="flex size-4.5 shrink-0 items-center justify-center">
        {icon}
      </span>
      {label}
    </Link>
  );
}
