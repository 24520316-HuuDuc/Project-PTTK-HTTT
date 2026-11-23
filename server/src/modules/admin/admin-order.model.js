// =====================================================================
// Entity: Order (phía NHÂN VIÊN / QUẢN LÝ) — TV4 PHỤ TRÁCH
// =====================================================================
const pool = require('../../config/db');
const Order = require('../shopping/order.model');
const { HttpError } = require('../../utils/http');
const { STAFF_TRANSITIONS, RESTOCK_STATUSES } = require('../../constants');

const SELECT_ADMIN_ORDER = `
  SELECT o.*, u.full_name AS customer_name, u.email AS customer_email,
         e.full_name AS handled_by_name
    FROM Orders o
    JOIN Users u ON u.user_id = o.user_id
    LEFT JOIN Users e ON e.user_id = o.handled_by`;

const AdminOrder = {
  canTransition(from, to) {
    return (STAFF_TRANSITIONS[from] || []).includes(to);
  },

  /**
   * UC14 TÌM KIẾM ĐƠN HÀNG theo mã đơn / tên khách / tên + SĐT người nhận, trạng thái, khoảng ngày đặt.
   * @param {{keyword?, status?, fromDate?, toDate?, limit?}} f
   */
  async search(f = {}) {
    const where = [];
    const params = [];
    if (f.keyword) {
      const like = `%${f.keyword}%`;
      const id = Number(String(f.keyword).replace(/^#/, ''));
      where.push('(o.order_id = ? OR u.full_name LIKE ? OR o.receiver_name LIKE ? OR o.receiver_phone LIKE ?)');
      params.push(Number.isInteger(id) ? id : 0, like, like, like);
    }
    if (f.status) {
      where.push('o.status = ?');
      params.push(f.status);
    }
    if (f.fromDate) {
      where.push('o.created_at >= ?');
      params.push(f.fromDate);
    }
    if (f.toDate) {
      where.push('o.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
      params.push(f.toDate);
    }
    let sql = `${SELECT_ADMIN_ORDER} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY o.created_at DESC`;
    if (f.limit) {
      sql += ' LIMIT ?';
      params.push(f.limit);
    }
    const [orders] = await pool.query(sql, params);
    return Order.attachItems(orders);
  },

  /** Chi tiết đơn: thông tin, sản phẩm, lịch sử trạng thái. */
  async findById(orderId) {
    const [orders] = await pool.query(`${SELECT_ADMIN_ORDER} WHERE o.order_id = ?`, [orderId]);
    if (!orders[0]) return null;
    const [order] = await Order.attachItems(orders);
    return { ...order, history: await Order.getHistory(orderId) };
  },

  /**
   * UC13 XỬ LÝ ĐƠN HÀNG theo State Diagram (transaction):
   *  - pending   -> confirmed (xác nhận) | rejected (từ chối, bắt buộc có lý do, hoàn kho)
   *  - confirmed -> shipping (giao cho vận chuyển)
   *  - shipping  -> delivered (giao thành công, khách thanh toán COD -> đã thanh toán)
   */
  async updateStatus(orderId, newStatus, staffId, note) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[order]] = await conn.query('SELECT status FROM Orders WHERE order_id = ? FOR UPDATE', [orderId]);
      if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng.');
      if (!this.canTransition(order.status, newStatus)) {
        throw new HttpError(400, `Không thể chuyển đơn từ "${order.status}" sang "${newStatus}".`);
      }
      if (newStatus === 'rejected' && !note) throw new HttpError(400, 'Vui lòng nhập lý do từ chối đơn hàng.');

      await conn.query('UPDATE Orders SET status = ?, handled_by = ? WHERE order_id = ?', [newStatus, staffId, orderId]);
      if (newStatus === 'delivered') {
        await conn.query("UPDATE Orders SET payment_status = 'paid', paid_at = NOW() WHERE order_id = ?", [orderId]);
      }
      if (RESTOCK_STATUSES.includes(newStatus)) await Order.restock(conn, orderId);
      await Order.addHistory(conn, orderId, order.status, newStatus, staffId, note || null);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = AdminOrder;
