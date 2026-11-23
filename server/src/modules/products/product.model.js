// =====================================================================
// Entity: Product (bảng Products, số lượng lấy từ Inventory) — TV2 PHỤ TRÁCH
// =====================================================================
const pool = require('../../config/db');

const SELECT_PRODUCT = `
  SELECT p.*, c.name AS category_name, c.status AS category_status,
         COALESCE(i.quantity, 0) AS stock
    FROM Products p
    JOIN Categories c ON c.category_id = p.category_id
    LEFT JOIN Inventory i ON i.product_id = p.product_id`;

function parseSpecs(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // không phải JSON thì trả nguyên chuỗi
  }
}

/** Đổi 1 dòng CSDL sang đối tượng gửi cho client. */
function toClient(row) {
  return {
    product_id: row.product_id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category_id: row.category_id,
    category: row.category_name,
    category_status: row.category_status,
    price: row.price,
    stock: row.stock,
    warranty_months: row.warranty_months,
    description: row.description,
    specs: parseSpecs(row.specs),
    image: row.image_url || null,
    status: row.status,
    created_at: row.created_at,
  };
}

const SORTS = {
  newest: 'p.created_at DESC, p.product_id DESC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  name: 'p.name ASC',
};

const Product = {
  toClient,

  /**
   * TÌM KIẾM SẢN PHẨM theo từ khóa (tên, SKU, thương hiệu), danh mục, khoảng giá, có sắp xếp.
   * forShop = true: chỉ sản phẩm đang kinh doanh thuộc danh mục đang sử dụng (phía khách).
   * @param {{keyword?, categoryId?, minPrice?, maxPrice?, sort?, status?, forShop?}} f
   */
  async search(f = {}) {
    const where = [];
    const params = [];
    if (f.forShop) where.push("p.status = 'active' AND c.status = 'active'");
    if (f.keyword) {
      where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)');
      const like = `%${f.keyword}%`;
      params.push(like, like, like);
    }
    if (f.categoryId) {
      where.push('p.category_id = ?');
      params.push(f.categoryId);
    }
    if (f.minPrice != null) {
      where.push('p.price >= ?');
      params.push(f.minPrice);
    }
    if (f.maxPrice != null) {
      where.push('p.price <= ?');
      params.push(f.maxPrice);
    }
    if (f.status) {
      where.push('p.status = ?');
      params.push(f.status);
    }
    const sql = `${SELECT_PRODUCT}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${SORTS[f.sort] || SORTS.newest}`;
    const [rows] = await pool.query(sql, params);
    return rows.map(toClient);
  },

  async findById(productId) {
    const [rows] = await pool.query(`${SELECT_PRODUCT} WHERE p.product_id = ?`, [productId]);
    return rows[0] ? toClient(rows[0]) : null;
  },

  /** Sản phẩm còn bán được với khách: đang kinh doanh và danh mục đang sử dụng. */
  isSellable(product) {
    return Boolean(product) && product.status === 'active' && product.category_status === 'active';
  },

  /** Thêm sản phẩm + tạo dòng tồn kho ban đầu (transaction). */
  async create(d, initialStock, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO Products (sku, category_id, name, brand, description, specs, warranty_months, price, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.sku, d.categoryId, d.name, d.brand, d.description, d.specs, d.warrantyMonths, d.price, d.imageUrl, d.status]
      );
      await conn.query('INSERT INTO Inventory (product_id, quantity, updated_by) VALUES (?, ?, ?)', [
        result.insertId,
        initialStock,
        userId,
      ]);
      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /** Sửa thông tin sản phẩm (số lượng tồn kho sửa ở Quản lý kho). */
  async update(productId, d) {
    await pool.query(
      `UPDATE Products
          SET sku = ?, category_id = ?, name = ?, brand = ?, description = ?, specs = ?,
              warranty_months = ?, price = ?, image_url = ?, status = ?
        WHERE product_id = ?`,
      [d.sku, d.categoryId, d.name, d.brand, d.description, d.specs, d.warrantyMonths, d.price, d.imageUrl, d.status, productId]
    );
  },

  /** Ngừng kinh doanh / kinh doanh lại (không xóa vật lý). */
  async setStatus(productId, status) {
    await pool.query('UPDATE Products SET status = ? WHERE product_id = ?', [status, productId]);
  },
};

module.exports = Product;
