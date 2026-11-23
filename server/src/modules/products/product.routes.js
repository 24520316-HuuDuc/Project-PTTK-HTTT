// Route module Sản phẩm, Danh mục, Kho — TV2 PHỤ TRÁCH
const express = require('express');
const product = require('./product.controller');
const category = require('./category.controller');
const inventory = require('./inventory.controller');
const { requireRole } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/http');
const { STAFF_ROLES } = require('../../constants');

const router = express.Router();
const staff = requireRole(...STAFF_ROLES); // Nhân viên + Quản lý

// Phía khách — khách vãng lai cũng xem, tìm kiếm được
router.get('/categories', asyncHandler(category.list));
router.get('/products', asyncHandler(product.search)); // UC06 tìm kiếm
router.get('/products/:id', asyncHandler(product.detail));

// Quản lý sản phẩm (UC07): thêm, sửa, xem, ngừng kinh doanh
router.get('/admin/products', staff, asyncHandler(product.adminList));
router.post('/admin/products', staff, asyncHandler(product.create));
router.put('/admin/products/:id', staff, asyncHandler(product.update));
router.patch('/admin/products/:id/status', staff, asyncHandler(product.setStatus));

// Quản lý danh mục (UC08): thêm, sửa, xóa hoặc ngừng sử dụng
router.get('/admin/categories', staff, asyncHandler(category.adminList));
router.post('/admin/categories', staff, asyncHandler(category.create));
router.put('/admin/categories/:id', staff, asyncHandler(category.update));
router.patch('/admin/categories/:id/status', staff, asyncHandler(category.setStatus));
router.delete('/admin/categories/:id', staff, asyncHandler(category.remove));

// Quản lý kho: kiểm tra, cập nhật số lượng tồn kho
router.get('/admin/inventory', staff, asyncHandler(inventory.list));
router.patch('/admin/inventory/:productId', staff, asyncHandler(inventory.update));

module.exports = router;
