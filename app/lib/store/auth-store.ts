import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS, UserRole } from "../mock-users";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (document: string, password: string) => AuthUser | null;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (document, password) => {
        const match = MOCK_USERS.find(
          (candidate) =>
            candidate.cpf === document && candidate.password === password,
        );
        if (!match) return null;

        const user: AuthUser = {
          id: match.id,
          name: match.name,
          role: match.role,
        };
        set({ user, isAuthenticated: true });
        return user;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "comanda-facil-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
