import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "inspector" | "reseller" | "customer" | "repair_partner" | "recycler";
  phone?: string;
  reliability_score?: number;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("relife_token", token);
      localStorage.setItem("relife_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("relife_token");
      localStorage.removeItem("relife_user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("relife_token");
      const userStr = localStorage.getItem("relife_user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch (e) {
          localStorage.removeItem("relife_token");
          localStorage.removeItem("relife_user");
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }
  },
}));
