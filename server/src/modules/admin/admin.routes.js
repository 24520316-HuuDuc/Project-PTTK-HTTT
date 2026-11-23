// Route module Quản trị đơn hàng & Thống kê — TV4 PHỤ TRÁCH
const express = require('express');
const order = require('./admin-order.controller');
const stats = require('./stats.controller');
const { requireRole } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/http');
const { ROLES } = require('../../constants');

const router = express.Router();
const staff = requireRole(ROLES.EMPLOYEE, ROLES.MANAGER);
const manager = requireRole(ROLES.MANAGER);

// Đơn hàng (UC13, UC14) — Nhân viên + Quản lý
router.get('/admin/orders', staff, asyncHandler(order.list));
router.get('/admin/orders/:id', staff, asyncHandler(order.detail));
router.patch('/admin/orders/:id/status', staff, asyncHandler(order.updateStatus));

// Dashboard + thống kê (UC15, UC16) — Quản lý
router.get('/admin/stats/overview', manager, asyncHandler(stats.overview));
router.get('/admin/stats/revenue', manager, asyncHandler(stats.revenue));
router.get('/admin/stats/order-status', manager, asyncHandler(stats.orderStatus));
router.get('/admin/stats/top-products', manager, asyncHandler(stats.topProducts));

module.exports = router;
