import { create } from "zustand";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  patchUser: (patch: Partial<AuthUser>) => void;
}

/** Global client-side view of the signed-in user (hydrated from the server session). */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  patchUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
}));
