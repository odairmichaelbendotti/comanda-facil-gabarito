"use client";

import Link from "next/link";
import { useAuthStore } from "../lib/store/auth-store";

const sizeClasses: Record<string, string> = {
  sm: "text-body-lg font-semibold",
  lg: "text-h2 font-bold",
};

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function Logo({ size = "sm", className = "" }: LogoProps) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const href = hasHydrated && isAuthenticated ? "/pedidos" : "/";

  return (
    <Link
      href={href}
      className={`font-display text-(--color-text-primary) transition-opacity duration-150 motion-reduce:transition-none hover:opacity-80 ${sizeClasses[size]} ${className}`}
    >
      Comanda
      <span className="text-(--color-brand-primary)">Fácil</span>
    </Link>
  );
}
