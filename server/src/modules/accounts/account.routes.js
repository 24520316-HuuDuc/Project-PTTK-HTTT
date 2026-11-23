// Route module Quản lý tài khoản — TV1 PHỤ TRÁCH
const express = require('express');
const auth = require('./auth.controller');
const userAdmin = require('./user-admin.controller');
const { authenticate, requireRole } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/http');
const { ROLES } = require('../../constants');

const router = express.Router();
const manager = requireRole(ROLES.MANAGER);

// Đăng ký (khách hàng), đăng nhập, đăng xuất phía client xóa token
router.post('/auth/register', asyncHandler(auth.register));
router.post('/auth/login', asyncHandler(auth.login));
router.get('/auth/me', authenticate, asyncHandler(auth.me));

// Thông tin cá nhân — mọi vai trò
router.put('/account/profile', authenticate, asyncHandler(auth.updateProfile));
router.put('/account/password', authenticate, asyncHandler(auth.changePassword));

// Quản lý tài khoản nhân viên và khách hàng — chỉ Người quản lý
router.get('/admin/users', manager, asyncHandler(userAdmin.list));
router.get('/admin/users/:id', manager, asyncHandler(userAdmin.detail));
router.post('/admin/users', manager, asyncHandler(userAdmin.create));
router.put('/admin/users/:id', manager, asyncHandler(userAdmin.update));
router.patch('/admin/users/:id/status', manager, asyncHandler(userAdmin.setStatus));
router.post('/admin/users/:id/reset-password', manager, asyncHandler(userAdmin.resetPassword));

module.exports = router;
