export type UserRole = "admin" | "garcom" | "cozinha";

export interface MockUser {
  id: string;
  name: string;
  cpf: string;
  password: string;
  role: UserRole;
}

// Autenticação ainda não tem backend — login valida contra esta lista fixa.
export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Odair Michael",
    cpf: "12345678900",
    password: "123456",
    role: "admin",
  },
  {
    id: "2",
    name: "Carlos Silva",
    cpf: "98765432100",
    password: "123456",
    role: "garcom",
  },
  {
    id: "3",
    name: "Maria Costa",
    cpf: "11122233344",
    password: "123456",
    role: "cozinha",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  garcom: "Garçom",
  cozinha: "Cozinha",
};
