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
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated || isAuthenticated) return;
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [hasHydrated, isAuthenticated, pathname, router]);

  if (!hasHydrated || !isAuthenticated || !user) {
    return <PageLoadingState />;
  }

  const allowedRoles = getAllowedRoles(pathname);
  const isAllowed = !allowedRoles || allowedRoles.includes(user.role);

  if (!isAllowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
