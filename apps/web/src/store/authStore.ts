import { create } from "zustand";
import { api } from "../api/client";

interface AuthStore {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const stored = localStorage.getItem("bl_token");

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: stored,
  user: null,

  login: async (email, password) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem("bl_token", res.data.token);
    set({ token: res.data.token, user: res.data.user });
  },

  logout: () => {
    localStorage.removeItem("bl_token");
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
