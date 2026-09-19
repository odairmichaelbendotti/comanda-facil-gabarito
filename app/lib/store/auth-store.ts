import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "../mock-users";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  estabelecimentoId: number;
}

// Mirrors GET /api/auth/sessao's `plano` — scoped to the establishment
// (shared quota), not tracked per person. `pedidosLimite` is null on a
// premium plan (no cap to display).
export interface PlanoInfo {
  premium: boolean;
  pedidosUsados: number;
  pedidosLimite: number | null;
}

interface AuthState {
  user: AuthUser | null;
  plano: PlanoInfo | null;
  // True once a `plano` object has actually arrived from the server at least
  // once (ProtectedRoute's session check) — distinct from `plano !== null`
  // because login/cadastro call setUser without a plano, leaving it null on
  // purpose until that first real fetch lands. Sidebar uses this to tell
  // "still loading" apart from "loaded, and it's null".
  planoLoaded: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: AuthUser, plano?: PlanoInfo | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      plano: null,
      planoLoaded: false,
      isAuthenticated: false,
      hasHydrated: false,
      // The actual credential check happens server-side (/api/auth/login,
      // /api/cadastro, /api/auth/sessao) against the database and an httpOnly
      // session cookie — this only mirrors that already-authenticated user
      // (and their plan/usage, once ProtectedRoute fetches it) into client
      // state so the UI (Sidebar, role checks) has something to read without
      // re-deriving it from the cookie on every render. `plano` is omitted
      // right after login/cadastro (those endpoints don't return it) and
      // filled in moments later by ProtectedRoute's session check.
      setUser: (user, plano = null) => {
        console.log("[auth-store] setUser called with:", user, "plano:", plano);
        set((state) => ({
          user,
          plano,
          isAuthenticated: true,
          planoLoaded: state.planoLoaded || plano !== null,
        }));
      },
      logout: () => {
        console.log("[auth-store] logout called");
        set({ user: null, plano: null, planoLoaded: false, isAuthenticated: false });
      },
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
