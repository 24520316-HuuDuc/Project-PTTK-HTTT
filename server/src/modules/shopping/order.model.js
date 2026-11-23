// =====================================================================
// Entity: Order + Order_Items + Order_Status_History (phía KHÁCH HÀNG) — TV3 PHỤ TRÁCH
// Phía nhân viên (tìm kiếm, xác nhận, từ chối, cập nhật): admin/admin-order.model.js (TV4)
// =====================================================================
const pool = require('../../config/db');
const Cart = require('./cart.model');
const Inventory = require('../products/inventory.model');
const { HttpError } = require('../../utils/http');

/** Gắn danh sách sản phẩm (items) vào từng đơn — 1 câu truy vấn cho nhiều đơn. */
async function attachItems(orders) {
  if (orders.length === 0) return orders;
  const ids = orders.map((o) => o.order_id);
  const [rows] = await pool.query(
    `SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
            (oi.quantity * oi.unit_price) AS line_total,
            p.sku, p.name, p.image_url AS image, c.name AS category
       FROM Order_Items oi
       JOIN Products p ON p.product_id = oi.product_id
       JOIN Categories c ON c.category_id = p.category_id
      WHERE oi.order_id IN (?)`,
    [ids]
  );
  return orders.map((o) => ({ ...o, items: rows.filter((r) => r.order_id === o.order_id) }));
}

/** Lịch sử trạng thái của 1 đơn, cũ -> mới. */
async function getHistory(orderId) {
  const [rows] = await pool.query(
    `SELECT h.history_id, h.from_status, h.to_status, h.note, h.changed_at,
            u.full_name AS changed_by_name, u.role AS changed_by_role
       FROM Order_Status_History h
       JOIN Users u ON u.user_id = h.changed_by
      WHERE h.order_id = ?
      ORDER BY h.changed_at, h.history_id`,
    [orderId]
  );
  return rows;
}

/** Ghi 1 dòng lịch sử trạng thái (dùng trong transaction). */
async function addHistory(conn, orderId, fromStatus, toStatus, userId, note = null) {
  await conn.query(
    'INSERT INTO Order_Status_History (order_id, from_status, to_status, note, changed_by) VALUES (?, ?, ?, ?, ?)',
    [orderId, fromStatus, toStatus, note, userId]
  );
}

/** Hoàn lại tồn kho khi đơn bị hủy hoặc bị từ chối (dùng trong transaction). */
async function restock(conn, orderId) {
  const [items] = await conn.query('SELECT product_id, quantity FROM Order_Items WHERE order_id = ?', [orderId]);
  for (const item of items) await Inventory.increase(conn, item.product_id, item.quantity);
}

const SELECT_ORDER = 'SELECT o.* FROM Orders o';

const Order = {
  attachItems,
  getHistory,
  addHistory,
  restock,

  /**
   * UC10 ĐẶT HÀNG (thanh toán COD) — chạy trong TRANSACTION:
   *  1. Khóa và đọc giỏ + tồn kho, kiểm tra đủ hàng
   *  2. Tạo Orders (pending, COD, chưa thanh toán)   3. Tạo Order_Items (giá tại thời điểm mua)
   *  4. Trừ tồn kho (Inventory)   5. Ghi lịch sử trạng thái   6. Xóa giỏ
   * @returns {Promise<{orderId: number, total: number}>}
   */
  async createFromCart(userId, shipping) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [items] = await conn.query(
        `SELECT ci.product_id, ci.quantity, p.name, p.price, p.status, c.status AS category_status,
                COALESCE(i.quantity, 0) AS stock
           FROM Carts ca
           JOIN Cart_Items ci ON ci.cart_id = ca.cart_id
           JOIN Products p ON p.product_id = ci.product_id
           JOIN Categories c ON c.category_id = p.category_id
           LEFT JOIN Inventory i ON i.product_id = p.product_id
          WHERE ca.user_id = ?
          FOR UPDATE`,
        [userId]
      );
      if (items.length === 0) throw new HttpError(400, 'Giỏ hàng đang trống.');
      for (const i of items) {
        if (i.status !== 'active' || i.category_status !== 'active') {
          throw new HttpError(400, `Sản phẩm "${i.name}" đã ngừng kinh doanh, vui lòng xóa khỏi giỏ.`);
        }
        if (i.stock < i.quantity) throw new HttpError(400, `Sản phẩm "${i.name}" chỉ còn ${i.stock} cái.`);
      }

      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const [result] = await conn.query(
        `INSERT INTO Orders (user_id, receiver_name, receiver_phone, shipping_address, note, total_amount,
                             status, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', 'COD', 'unpaid')`,
        [userId, shipping.receiverName, shipping.receiverPhone, shipping.shippingAddress, shipping.note || null, total]
      );
      const orderId = result.insertId;

      await conn.query('INSERT INTO Order_Items (order_id, product_id, quantity, unit_price) VALUES ?', [
        items.map((i) => [orderId, i.product_id, i.quantity, i.price]),
      ]);
      for (const i of items) await Inventory.decrease(conn, i.product_id, i.quantity);
      await addHistory(conn, orderId, null, 'pending', userId);
      await Cart.clear(userId, conn);

      await conn.commit();
      return { orderId, total };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /** UC12 Lịch sử đơn hàng của khách, mới nhất trước. */
  async findByUser(userId) {
    const [orders] = await pool.query(`${SELECT_ORDER} WHERE o.user_id = ? ORDER BY o.created_at DESC`, [userId]);
    const withItems = await attachItems(orders);
    // Lý do từ chối (nếu có) để khách biết
    return Promise.all(withItems.map(async (o) => ({ ...o, history: await getHistory(o.order_id) })));
  },

  /** Khách hủy đơn — chỉ khi đơn còn "Chờ xác nhận". Hoàn lại tồn kho. */
  async cancelByCustomer(orderId, userId, reason) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[order]] = await conn.query('SELECT status FROM Orders WHERE order_id = ? AND user_id = ? FOR UPDATE', [
        orderId,
        userId,
      ]);
      if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng.');
      if (order.status !== 'pending') throw new HttpError(400, 'Chỉ hủy được đơn đang ở trạng thái Chờ xác nhận.');
      await conn.query("UPDATE Orders SET status = 'cancelled' WHERE order_id = ?", [orderId]);
      await restock(conn, orderId);
      await addHistory(conn, orderId, 'pending', 'cancelled', userId, reason || 'Khách hàng hủy đơn');
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = Order;
