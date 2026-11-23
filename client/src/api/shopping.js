// API module Giỏ hàng, Đặt hàng — TV3 PHỤ TRÁCH
import { api } from "./client";

export const getCart = () => api.get("/cart");
export const addToCart = (productId, quantity = 1) => api.post("/cart/items", { productId, quantity });
export const updateCartItem = (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity });
export const removeCartItem = (productId) => api.del(`/cart/items/${productId}`);

/** data: { receiverName, receiverPhone, shippingAddress, note } — thanh toán COD */
export const placeOrder = (data) => api.post("/orders", { ...data, paymentMethod: "COD" });
export const getMyOrders = () => api.get("/orders");
export const cancelMyOrder = (id, reason) => api.post(`/orders/${id}/cancel`, { reason });
