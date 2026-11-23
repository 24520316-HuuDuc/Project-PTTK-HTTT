// API module Quản lý tài khoản — TV1 PHỤ TRÁCH
import { api } from "./client";

export const register = (data) => api.post("/auth/register", data);
export const login = (email, password) => api.post("/auth/login", { email, password });
export const getMe = () => api.get("/auth/me");

export const updateProfile = (data) => api.put("/account/profile", data);
export const changePassword = (currentPassword, newPassword) =>
  api.put("/account/password", { currentPassword, newPassword });

// Quản lý tài khoản nhân viên + khách hàng (Người quản lý)
/** filters: { q, role, status } */
export const searchUsers = (filters) => api.get("/admin/users", filters);
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const createUser = (data) => api.post("/admin/users", data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const setUserStatus = (id, status) => api.patch(`/admin/users/${id}/status`, { status });
export const resetUserPassword = (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword });
