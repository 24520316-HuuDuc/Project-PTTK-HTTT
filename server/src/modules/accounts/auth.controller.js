// =====================================================================
// Control: Đăng ký, đăng nhập, thông tin cá nhân — TV1 PHỤ TRÁCH
// =====================================================================
const bcrypt = require('bcryptjs');
const User = require('./user.model');
const { signToken } = require('../../middlewares/auth');
const { HttpError, str, PHONE_REGEX, EMAIL_REGEX } = require('../../utils/http');
const { ROLES } = require('../../constants');

/** POST /api/auth/register — UC01 Đăng ký */
exports.register = async (req, res) => {
  const fullName = str(req.body.fullName);
  const email = str(req.body.email).toLowerCase();
  const phone = str(req.body.phone);
  const address = str(req.body.address);
  const password = req.body.password || '';

  if (!fullName) throw new HttpError(400, 'Vui lòng nhập họ tên.');
  if (!EMAIL_REGEX.test(email)) throw new HttpError(400, 'Email không hợp lệ.');
  if (phone && !PHONE_REGEX.test(phone)) throw new HttpError(400, 'Số điện thoại không hợp lệ.');
  if (password.length < 6) throw new HttpError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  if (await User.findByEmail(email)) throw new HttpError(409, 'Email này đã được đăng ký.');

  const passwordHash = bcrypt.hashSync(password, 10);
  await User.create({ fullName, email, passwordHash, phone, address, role: ROLES.CUSTOMER });
  res.status(201).json({ message: 'Đăng ký thành công. Vui lòng đăng nhập.' });
};

/** POST /api/auth/login — UC02 Đăng nhập */
exports.login = async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = req.body.password || '';
  if (!email || !password) throw new HttpError(400, 'Vui lòng nhập email và mật khẩu.');

  const user = await User.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new HttpError(401, 'Email hoặc mật khẩu không đúng.');
  }
  if (user.status === 'locked') throw new HttpError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ cửa hàng.');

  res.json({ token: signToken(user), user: User.toPublic(user) });
};

/** GET /api/auth/me — thông tin người đang đăng nhập */
exports.me = async (req, res) => {
  const user = await User.findById(req.user.user_id);
  if (!user || user.status === 'locked') throw new HttpError(401, 'Tài khoản không còn hoạt động.');
  res.json({ user: User.toPublic(user) });
};

/** PUT /api/account/profile — UC03 Cập nhật thông tin cá nhân */
exports.updateProfile = async (req, res) => {
  const fullName = str(req.body.fullName);
  const phone = str(req.body.phone);
  const address = str(req.body.address);
  if (!fullName) throw new HttpError(400, 'Vui lòng nhập họ tên.');
  if (phone && !PHONE_REGEX.test(phone)) throw new HttpError(400, 'Số điện thoại không hợp lệ.');

  await User.updateProfile(req.user.user_id, { fullName, phone, address });
  const user = await User.findById(req.user.user_id);
  res.json({ message: 'Đã cập nhật thông tin.', user: User.toPublic(user) });
};

/** PUT /api/account/password — UC03 Đổi mật khẩu */
exports.changePassword = async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body;
  const user = await User.findById(req.user.user_id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    throw new HttpError(400, 'Mật khẩu hiện tại không đúng.');
  }
  if (newPassword.length < 6) throw new HttpError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
  await User.updatePassword(user.user_id, bcrypt.hashSync(newPassword, 10));
  res.json({ message: 'Đã đổi mật khẩu.' });
};
