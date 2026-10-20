import { api } from "./client";

export const authApi = {
  register: (payload) => api.post("/api/auth/register", payload),
  login: (payload) => api.post("/api/auth/login", payload),
  logout: () => api.post("/api/auth/logout"),
  refreshToken: (payload) => api.post("/api/auth/refresh-token", payload),
  changePassword: (payload) => api.post("/api/auth/change-password", payload),
};
