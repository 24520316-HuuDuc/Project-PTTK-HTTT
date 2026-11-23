// =====================================================================
// Entity: Cart + Cart_Items (bảng Carts, Cart_Items) — TV3 PHỤ TRÁCH
// =====================================================================
const pool = require('../../config/db');

const Cart = {
  /** cart_id của khách; chưa có thì tạo. */
  async getCartId(userId) {
    const [rows] = await pool.query('SELECT cart_id FROM Carts WHERE user_id = ?', [userId]);
    if (rows[0]) return rows[0].cart_id;
    const [result] = await pool.query('INSERT INTO Carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  },

  /** Các dòng trong giỏ kèm thông tin sản phẩm và tồn kho. */
  async getItems(userId) {
    const [rows] = await pool.query(
      `SELECT p.product_id, p.sku, p.name, p.brand, p.price, p.status, p.image_url AS image,
              c.name AS category, c.status AS category_status,
              COALESCE(i.quantity, 0) AS stock, ci.quantity
         FROM Carts ca
         JOIN Cart_Items ci ON ci.cart_id = ca.cart_id
         JOIN Products p ON p.product_id = ci.product_id
         JOIN Categories c ON c.category_id = p.category_id
         LEFT JOIN Inventory i ON i.product_id = p.product_id
        WHERE ca.user_id = ?
        ORDER BY ci.added_at`,
      [userId]
    );
    return rows;
  },

  async getQuantity(userId, productId) {
    const [rows] = await pool.query(
      `SELECT ci.quantity FROM Carts ca JOIN Cart_Items ci ON ci.cart_id = ca.cart_id
        WHERE ca.user_id = ? AND ci.product_id = ?`,
      [userId, productId]
    );
    return rows[0] ? rows[0].quantity : 0;
  },

  /** Đặt số lượng một sản phẩm trong giỏ (thêm mới hoặc cập nhật). quantity <= 0 thì xóa. */
  async setQuantity(userId, productId, quantity) {
    const cartId = await this.getCartId(userId);
    if (quantity <= 0) {
      await pool.query('DELETE FROM Cart_Items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
      return;
    }
    await pool.query(
      `INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [cartId, productId, quantity]
    );
  },

  async removeItem(userId, productId) {
    await this.setQuantity(userId, productId, 0);
  },

  /** Xóa sạch giỏ (dùng conn để chạy được trong transaction đặt hàng). */
  async clear(userId, conn = pool) {
    await conn.query(
      'DELETE ci FROM Cart_Items ci JOIN Carts ca ON ca.cart_id = ci.cart_id WHERE ca.user_id = ?',
      [userId]
    );
  },
};

module.exports = Cart;
