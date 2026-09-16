import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "../mock-users";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  estabelecimentoId: number;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      // The actual credential check happens server-side (/api/auth/login,
      // /api/cadastro) against the database and an httpOnly session cookie —
      // this only mirrors that already-authenticated user into client state
      // so the UI (ProtectedRoute, Sidebar, role checks) has something to
      // read without re-deriving it from the cookie on every render.
      setUser: (user) => set({ user, isAuthenticated: true }),
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
