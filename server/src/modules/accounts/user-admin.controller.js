// =====================================================================
// Control: Quản lý tài khoản nhân viên và khách hàng (chỉ Người quản lý) — TV1 PHỤ TRÁCH
// UC04 Quản lý tài khoản: tìm kiếm, xem, tạo tài khoản nhân viên, sửa, khóa / mở khóa
// =====================================================================
const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Order = require('../shopping/order.model');
const { HttpError, str, PHONE_REGEX, EMAIL_REGEX } = require('../../utils/http');
const { ROLES, STAFF_ROLES, USER_STATUSES } = require('../../constants');

const ALL_ROLES = Object.values(ROLES);

async function findOrFail(id) {
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'Không tìm thấy tài khoản.');
  return user;
}

/** GET /api/admin/users?q=&role=&status= — TÌM KIẾM tài khoản */
exports.list = async (req, res) => {
  const users = await User.search({
    keyword: str(req.query.q),
    role: ALL_ROLES.includes(req.query.role) ? req.query.role : '',
    status: USER_STATUSES.includes(req.query.status) ? req.query.status : '',
  });
  res.json({ users });
};

/** GET /api/admin/users/:id — chi tiết (khách hàng kèm lịch sử đơn) */
exports.detail = async (req, res) => {
  const user = await findOrFail(req.params.id);
  const orders = user.role === ROLES.CUSTOMER ? await Order.findByUser(user.user_id) : [];
  res.json({ user: User.toPublic(user), orders });
};

/** POST /api/admin/users — tạo tài khoản NHÂN VIÊN / QUẢN LÝ (khách hàng tự đăng ký) */
exports.create = async (req, res) => {
  const fullName = str(req.body.fullName);
  const email = str(req.body.email).toLowerCase();
  const phone = str(req.body.phone);
  const password = req.body.password || '';
  const role = req.body.role || ROLES.EMPLOYEE;

  if (!fullName) throw new HttpError(400, 'Vui lòng nhập họ tên.');
  if (!EMAIL_REGEX.test(email)) throw new HttpError(400, 'Email không hợp lệ.');
  if (phone && !PHONE_REGEX.test(phone)) throw new HttpError(400, 'Số điện thoại không hợp lệ.');
  if (password.length < 6) throw new HttpError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  if (!STAFF_ROLES.includes(role)) throw new HttpError(400, 'Chỉ tạo được tài khoản Nhân viên hoặc Quản lý.');
  if (await User.findByEmail(email)) throw new HttpError(409, 'Email này đã được sử dụng.');

  const id = await User.create({ fullName, email, phone, address: str(req.body.address), role, passwordHash: bcrypt.hashSync(password, 10) });
  res.status(201).json({ message: 'Đã tạo tài khoản.', user: User.toPublic(await User.findById(id)) });
};

/** PUT /api/admin/users/:id — sửa thông tin; đổi vai trò giữa Nhân viên / Quản lý */
exports.update = async (req, res) => {
  const user = await findOrFail(req.params.id);
  const fullName = str(req.body.fullName);
  const phone = str(req.body.phone);
  if (!fullName) throw new HttpError(400, 'Vui lòng nhập họ tên.');
  if (phone && !PHONE_REGEX.test(phone)) throw new HttpError(400, 'Số điện thoại không hợp lệ.');
  await User.updateProfile(user.user_id, { fullName, phone, address: str(req.body.address) });

  const role = req.body.role;
  if (role && role !== user.role) {
    if (user.role === ROLES.CUSTOMER || !STAFF_ROLES.includes(role)) {
      throw new HttpError(400, 'Chỉ đổi vai trò giữa Nhân viên và Quản lý.');
    }
    if (user.user_id === req.user.user_id) throw new HttpError(400, 'Không thể tự đổi vai trò của chính mình.');
    await User.updateRole(user.user_id, role);
  }
  res.json({ message: 'Đã cập nhật tài khoản.', user: User.toPublic(await User.findById(user.user_id)) });
};

/** PATCH /api/admin/users/:id/status  { status: 'active' | 'locked' } */
exports.setStatus = async (req, res) => {
  const { status } = req.body;
  if (!USER_STATUSES.includes(status)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  const user = await findOrFail(req.params.id);
  if (user.user_id === req.user.user_id) throw new HttpError(400, 'Không thể tự khóa tài khoản của chính mình.');
  await User.setStatus(user.user_id, status);
  res.json({ message: status === 'locked' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.' });
};

/** POST /api/admin/users/:id/reset-password { newPassword } — đặt lại mật khẩu */
exports.resetPassword = async (req, res) => {
  const user = await findOrFail(req.params.id);
  const newPassword = req.body.newPassword || '';
  if (newPassword.length < 6) throw new HttpError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
  await User.updatePassword(user.user_id, bcrypt.hashSync(newPassword, 10));
  res.json({ message: `Đã đặt lại mật khẩu cho ${user.full_name}.` });
};
