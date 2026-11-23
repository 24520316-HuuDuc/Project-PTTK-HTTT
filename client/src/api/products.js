// API module Sản phẩm, Danh mục, Kho — TV2 PHỤ TRÁCH
import { api } from "./client";

// Phía khách
export const getCategories = () => api.get("/categories");
/** filters: { q, category, min, max, sort } */
export const searchProducts = (filters) => api.get("/products", filters);
export const getProduct = (id) => api.get(`/products/${id}`);

// Quản lý sản phẩm (Nhân viên, Quản lý)
export const adminSearchProducts = (filters) => api.get("/admin/products", filters);
export const createProduct = (data) => api.post("/admin/products", data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
/** status: 'discontinued' (ngừng kinh doanh) | 'active' (kinh doanh lại) */
export const setProductStatus = (id, status) => api.patch(`/admin/products/${id}/status`, { status });

// Quản lý danh mục
export const adminGetCategories = () => api.get("/admin/categories");
export const createCategory = (data) => api.post("/admin/categories", data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
/** status: 'inactive' (ngừng sử dụng) | 'active' */
export const setCategoryStatus = (id, status) => api.patch(`/admin/categories/${id}/status`, { status });
export const deleteCategory = (id) => api.del(`/admin/categories/${id}`);

// Quản lý kho
/** filters: { q, category, low } — low = ngưỡng sắp hết */
export const getInventory = (filters) => api.get("/admin/inventory", filters);
/** mode: 'add' (nhập thêm) | 'set' (kiểm kê, đặt lại) */
export const updateInventory = (productId, mode, quantity) =>
  api.patch(`/admin/inventory/${productId}`, { mode, quantity });
