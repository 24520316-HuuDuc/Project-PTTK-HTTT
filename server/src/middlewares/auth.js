// Xác thực bằng JWT + phân quyền theo vai trò — TV1 PHỤ TRÁCH
//
// Client gửi header:  Authorization: Bearer <token>
// Sau khi qua authenticate, req.user = { user_id, full_name, email, role }
const jwt = require('jsonwebtoken');
const { HttpError } = require('../utils/http');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  const payload = {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Vui lòng đăng nhập.'));
  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return next(new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'));
  }
}

/**
 * Chỉ cho các vai trò được liệt kê. Đã gồm luôn bước authenticate.
 * Dùng: router.get('/admin/x', requireRole('manager'), handler)
 */
function requireRole(...roles) {
  return [
    authenticate,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new HttpError(403, 'Bạn không có quyền thực hiện chức năng này.'));
      }
      return next();
    },
  ];
}

module.exports = { signToken, authenticate, requireRole };
