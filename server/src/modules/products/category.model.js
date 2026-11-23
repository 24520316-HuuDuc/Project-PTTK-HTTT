// =====================================================================
// Entity: Category (bảng Categories) — TV2 PHỤ TRÁCH
// =====================================================================
const pool = require('../../config/db');

const Category = {
  /**
   * Danh mục kèm số sản phẩm đang kinh doanh.
   * onlyActive = true: chỉ danh mục đang sử dụng (phía khách).
   */
  async findAll({ onlyActive = false } = {}) {
    const [rows] = await pool.query(
      `SELECT c.category_id, c.name, c.description, c.status, c.created_at,
              COUNT(p.product_id) AS product_count
         FROM Categories c
         LEFT JOIN Products p ON p.category_id = c.category_id AND p.status = 'active'
        ${onlyActive ? "WHERE c.status = 'active'" : ''}
        GROUP BY c.category_id, c.name, c.description, c.status, c.created_at
        ORDER BY c.category_id`
    );
    return rows;
  },

  async findById(categoryId) {
    const [rows] = await pool.query('SELECT * FROM Categories WHERE category_id = ?', [categoryId]);
    return rows[0] || null;
  },

  async create({ name, description }) {
    const [result] = await pool.query('INSERT INTO Categories (name, description) VALUES (?, ?)', [
      name,
      description || null,
    ]);
    return result.insertId;
  },

  async update(categoryId, { name, description }) {
    await pool.query('UPDATE Categories SET name = ?, description = ? WHERE category_id = ?', [
      name,
      description || null,
      categoryId,
    ]);
  },

  /** Ngừng sử dụng / sử dụng lại: status = 'active' | 'inactive' */
  async setStatus(categoryId, status) {
    await pool.query('UPDATE Categories SET status = ? WHERE category_id = ?', [status, categoryId]);
  },

  /** Tổng số sản phẩm thuộc danh mục (kể cả ngừng kinh doanh). */
  async countProducts(categoryId) {
    const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM Products WHERE category_id = ?', [categoryId]);
    return row.total;
  },

  async remove(categoryId) {
    await pool.query('DELETE FROM Categories WHERE category_id = ?', [categoryId]);
  },
};

module.exports = Category;
