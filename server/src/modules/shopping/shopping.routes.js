// Route module Giỏ hàng, Đặt hàng — TV3 PHỤ TRÁCH
const express = require('express');
const cart = require('./cart.controller');
const order = require('./order.controller');
const { requireRole } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/http');
const { ROLES } = require('../../constants');

const router = express.Router();
const customer = requireRole(ROLES.CUSTOMER); // khách phải đăng nhập mới được mua

// Giỏ hàng (UC09)
router.get('/cart', customer, asyncHandler(cart.get));
router.post('/cart/items', customer, asyncHandler(cart.add));
router.put('/cart/items/:productId', customer, asyncHandler(cart.update));
router.delete('/cart/items/:productId', customer, asyncHandler(cart.remove));

// Đặt hàng COD (UC10), lịch sử đơn (UC11), hủy đơn (UC12)
router.post('/orders', customer, asyncHandler(order.create));
router.get('/orders', customer, asyncHandler(order.listMine));
router.post('/orders/:id/cancel', customer, asyncHandler(order.cancelMine));

module.exports = router;
