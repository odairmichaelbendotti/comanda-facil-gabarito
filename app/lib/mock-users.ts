export type UserRole = "admin" | "garcom" | "cozinha";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  garcom: "Garçom",
  cozinha: "Cozinha",
};
