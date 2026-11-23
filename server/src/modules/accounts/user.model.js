// =====================================================================
// Entity: User (bảng Users) — TV1 PHỤ TRÁCH
// =====================================================================
const pool = require('../../config/db');

/** Bỏ password_hash trước khi trả về client. */
function toPublic(user) {
  if (!user) return null;
  const { password_hash: _hidden, ...rest } = user;
  return rest;
}

const User = {
  toPublic,

  async findById(userId) {
    const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  /** @returns {Promise<number>} user_id mới */
  async create({ fullName, email, passwordHash, phone, address, role = 'customer' }) {
    const [result] = await pool.query(
      'INSERT INTO Users (full_name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, passwordHash, phone || null, address || null, role]
    );
    return result.insertId;
  },

  async updateProfile(userId, { fullName, phone, address }) {
    await pool.query('UPDATE Users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?', [
      fullName,
      phone || null,
      address || null,
      userId,
    ]);
  },

  async updateRole(userId, role) {
    await pool.query('UPDATE Users SET role = ? WHERE user_id = ?', [role, userId]);
  },

  async updatePassword(userId, passwordHash) {
    await pool.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
  },

  /**
   * TÌM KIẾM TÀI KHOẢN theo tên / email / số điện thoại, lọc theo vai trò và trạng thái.
   * Kèm số đơn và tổng tiền đã mua (đơn đã giao) — có ý nghĩa với khách hàng.
   */
  async search({ keyword = '', role = '', status = '' } = {}) {
    const where = [];
    const params = [];
    if (keyword) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const like = `%${keyword}%`;
      params.push(like, like, like);
    }
    if (role) {
      where.push('u.role = ?');
      params.push(role);
    }
    if (status) {
      where.push('u.status = ?');
      params.push(status);
    }
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.address, u.role, u.status, u.created_at,
              COUNT(o.order_id) AS order_count,
              COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) AS total_spent
         FROM Users u
         LEFT JOIN Orders o ON o.user_id = u.user_id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        GROUP BY u.user_id, u.full_name, u.email, u.phone, u.address, u.role, u.status, u.created_at
        ORDER BY FIELD(u.role, 'manager', 'employee', 'customer'), u.created_at DESC`,
      params
    );
    return rows;
  },

  /** Khóa / mở khóa: status = 'active' | 'locked' */
  async setStatus(userId, status) {
    await pool.query('UPDATE Users SET status = ? WHERE user_id = ?', [status, userId]);
  },
};

module.exports = User;
