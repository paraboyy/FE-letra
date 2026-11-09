import apiClient from "../api";
import { User } from "../types";

export interface LoginCredentials {
  email: string;
  password: string;
  role?: "customer" | "admin" | "staff";
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const res = await apiClient.post<User>("/auth/login", credentials);
    if (res.data?.token && typeof window !== "undefined") {
      localStorage.setItem("letra_auth_token", res.data.token);
      localStorage.setItem("letra_user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("auth_change"));
    }
    return res.data;
  },

  async register(payload: { name: string; email: string; phone: string; password: string }): Promise<User> {
    const res = await apiClient.post<User>("/auth/register", payload);
    if (res.data?.token && typeof window !== "undefined") {
      localStorage.setItem("letra_auth_token", res.data.token);
      localStorage.setItem("letra_user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("auth_change"));
    }
    return res.data;
  },

  async updateProfile(payload: { id?: string; email?: string; name: string; phone: string; password?: string }): Promise<User> {
    const res = await apiClient.put<User>("/auth/profile", payload);
    if (res.data && typeof window !== "undefined") {
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        ...res.data,
        token: currentUser?.token || res.data.token,
      };
      localStorage.setItem("letra_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("auth_change"));
    }
    return res.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("letra_auth_token");
      localStorage.removeItem("letra_user");
      window.dispatchEvent(new Event("auth_change"));
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("letra_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("letra_auth_token");
    }
    return false;
  },
};
