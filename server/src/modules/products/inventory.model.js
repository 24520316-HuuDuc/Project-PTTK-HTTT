// =====================================================================
// Entity: Inventory (bảng Inventory) — TV2 PHỤ TRÁCH
// Quản lý kho: theo dõi và cập nhật số lượng tồn kho
// =====================================================================
const pool = require('../../config/db');

const Inventory = {
  /**
   * Danh sách tồn kho, tìm theo tên/SKU, lọc danh mục, chỉ sản phẩm sắp hết.
   * @param {{keyword?, categoryId?, lowStock?: number}} f  lowStock = ngưỡng (vd 5)
   */
  async list(f = {}) {
    const where = [];
    const params = [];
    if (f.keyword) {
      where.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${f.keyword}%`, `%${f.keyword}%`);
    }
    if (f.categoryId) {
      where.push('p.category_id = ?');
      params.push(f.categoryId);
    }
    if (f.lowStock != null) {
      where.push("COALESCE(i.quantity, 0) <= ? AND p.status = 'active'");
      params.push(f.lowStock);
    }
    const [rows] = await pool.query(
      `SELECT p.product_id, p.sku, p.name, p.status, c.name AS category,
              COALESCE(i.quantity, 0) AS quantity, i.updated_at, u.full_name AS updated_by_name,
              (SELECT COALESCE(SUM(oi.quantity), 0)
                 FROM Order_Items oi JOIN Orders o ON o.order_id = oi.order_id
                WHERE oi.product_id = p.product_id AND o.status IN ('pending', 'confirmed')) AS reserved
         FROM Products p
         JOIN Categories c ON c.category_id = p.category_id
         LEFT JOIN Inventory i ON i.product_id = p.product_id
         LEFT JOIN Users u ON u.user_id = i.updated_by
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY quantity ASC, p.name`,
      params
    );
    return rows;
  },

  async getQuantity(productId) {
    const [rows] = await pool.query('SELECT quantity FROM Inventory WHERE product_id = ?', [productId]);
    return rows[0] ? rows[0].quantity : null;
  },

  /** Đặt số lượng mới (tạo dòng nếu sản phẩm chưa có trong kho). */
  async setQuantity(productId, quantity, userId) {
    await pool.query(
      `INSERT INTO Inventory (product_id, quantity, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_by = VALUES(updated_by)`,
      [productId, quantity, userId]
    );
  },

  /** Trừ kho khi đặt hàng (dùng trong transaction). */
  async decrease(conn, productId, quantity) {
    await conn.query('UPDATE Inventory SET quantity = quantity - ? WHERE product_id = ?', [quantity, productId]);
  },

  /** Hoàn kho khi hủy / từ chối đơn (dùng trong transaction). */
  async increase(conn, productId, quantity) {
    await conn.query('UPDATE Inventory SET quantity = quantity + ? WHERE product_id = ?', [quantity, productId]);
  },
};

module.exports = Inventory;
