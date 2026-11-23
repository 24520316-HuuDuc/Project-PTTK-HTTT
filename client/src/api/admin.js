// API module Quản trị đơn hàng & Thống kê — TV4 PHỤ TRÁCH
import { api } from "./client";

/** filters: { q, status, from, to } */
export const searchOrders = (filters) => api.get("/admin/orders", filters);
export const getOrder = (id) => api.get(`/admin/orders/${id}`);
/** note: bắt buộc khi từ chối (lý do) */
export const updateOrderStatus = (id, status, note) => api.patch(`/admin/orders/${id}/status`, { status, note });

export const getOverview = () => api.get("/admin/stats/overview");
/** { mode: 'day', from, to } hoặc { mode: 'month', year } */
export const getRevenue = (params) => api.get("/admin/stats/revenue", params);
export const getOrderStatusStats = (params) => api.get("/admin/stats/order-status", params);
export const getTopProducts = (params) => api.get("/admin/stats/top-products", params);
