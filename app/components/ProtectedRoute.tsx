"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../lib/store/auth-store";
import { getAllowedRoles } from "../lib/permissions";
import AccessDenied from "./AccessDenied";
import PageLoadingState from "./PageLoadingState";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Guarda de rota central: a rota que a envolver só precisa ter uma entrada
// em ROUTE_ACCESS (app/lib/permissions.ts) com os papéis permitidos.
//
// A store local (localStorage) só serve para evitar um flash de loading ao
// navegar entre páginas já autenticadas — quem decide de verdade é sempre
// GET /api/auth/sessao, que lê o cookie httpOnly e o banco a cada chamada
// (conta desativada, sessão expirada etc. refletem na hora, não só depois
// de o token JWT vencer).
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    fetch("/api/auth/sessao", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;

        if (!response.ok) {
          logout();
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const data = await response.json();
        setUser(
          {
            id: data.id,
            name: data.nome,
            role: data.role,
            estabelecimentoId: data.estabelecimentoId,
          },
          data.plano,
        );
      })
      .catch(() => {
        // A network hiccup shouldn't log someone out — keep whatever session
        // is already cached locally and try again on the next navigation.
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, pathname, router, setUser, logout]);

  if (!hasHydrated || !user) {
    return <PageLoadingState />;
  }

  const allowedRoles = getAllowedRoles(pathname);
  const isAllowed = !allowedRoles || allowedRoles.includes(user.role);

  if (!isAllowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
