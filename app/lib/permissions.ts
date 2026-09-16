import { UserRole } from "./mock-users";

// Único lugar que declara quais papéis acessam cada rota privada.
// Uma rota nova só precisa de uma entrada aqui — o layout de (private)
// aplica a checagem automaticamente a partir do pathname atual.
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/pedidos": ["admin", "garcom", "cozinha"],
  "/produtos": ["admin"],
  "/configuracoes": ["admin"],
  "/funcionarios": ["admin"],
};

export function getAllowedRoles(pathname: string): UserRole[] | undefined {
  return ROUTE_ACCESS[pathname];
}

export function isRouteAllowed(pathname: string, role: UserRole): boolean {
  const allowedRoles = getAllowedRoles(pathname);
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}

// Permissões de ação dentro da tela de Pedidos.
const ORDER_MANAGE_ROLES: UserRole[] = ["admin", "garcom"];
const ORDER_PREP_ROLES: UserRole[] = ["admin", "cozinha"];

export function canManageOrders(role: UserRole): boolean {
  return ORDER_MANAGE_ROLES.includes(role);
}

export function canPrepareOrders(role: UserRole): boolean {
  return ORDER_PREP_ROLES.includes(role);
}
