// =====================================================================
// Thống kê / báo cáo — TV4 PHỤ TRÁCH
// Quy ước: doanh thu chỉ tính đơn có status = 'delivered', theo ngày đặt hàng.
// =====================================================================
const pool = require('../../config/db');
const { ORDER_STATUS } = require('../../constants');

/** Danh sách ngày 'YYYY-MM-DD' từ from đến to (để biểu đồ không bị thiếu ngày). */
function eachDay(from, to) {
  const days = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (d <= end && days.length < 366) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

const Stats = {
  /** Số liệu tổng quan cho Dashboard. */
  async overview() {
    const [[row]] = await pool.query(
      `SELECT
         (SELECT COALESCE(SUM(total_amount), 0) FROM Orders WHERE status = 'delivered') AS revenue,
         (SELECT COALESCE(SUM(total_amount), 0) FROM Orders
           WHERE status = 'delivered' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')) AS revenue_this_month,
         (SELECT COUNT(*) FROM Orders) AS total_orders,
         (SELECT COUNT(*) FROM Orders WHERE status = 'pending') AS pending_orders,
         (SELECT COUNT(*) FROM Users WHERE role = 'customer') AS customers,
         (SELECT COUNT(*) FROM Products p LEFT JOIN Inventory i ON i.product_id = p.product_id
           WHERE p.status = 'active' AND COALESCE(i.quantity, 0) <= 5) AS low_stock`
    );
    return row;
  },

  /** THỐNG KÊ DOANH THU THEO NGÀY trong [from, to]. */
  async revenueByDay(from, to) {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS orders, SUM(total_amount) AS revenue
         FROM Orders
        WHERE status = 'delivered' AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY day`,
      [from, to]
    );
    return eachDay(from, to).map((day) => {
      const r = rows.find((x) => x.day === day);
      return { key: day, label: `${day.slice(8, 10)}/${day.slice(5, 7)}`, orders: r ? r.orders : 0, revenue: r ? Number(r.revenue) : 0 };
    });
  },

  /** THỐNG KÊ DOANH THU THEO THÁNG của một năm (đủ 12 tháng). */
  async revenueByMonth(year) {
    const [rows] = await pool.query(
      `SELECT MONTH(created_at) AS month, COUNT(*) AS orders, SUM(total_amount) AS revenue
         FROM Orders
        WHERE status = 'delivered' AND YEAR(created_at) = ?
        GROUP BY MONTH(created_at)`,
      [year]
    );
    return Array.from({ length: 12 }, (_, i) => {
      const r = rows.find((x) => x.month === i + 1);
      return { key: `${year}-${i + 1}`, label: `T${i + 1}`, orders: r ? r.orders : 0, revenue: r ? Number(r.revenue) : 0 };
    });
  },

  /** THỐNG KÊ SỐ LƯỢNG ĐƠN theo từng trạng thái (đủ 6 trạng thái). */
  async orderCountByStatus(from, to) {
    const where = [];
    const params = [];
    if (from) {
      where.push('created_at >= ?');
      params.push(from);
    }
    if (to) {
      where.push('created_at < DATE_ADD(?, INTERVAL 1 DAY)');
      params.push(to);
    }
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS total FROM Orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''} GROUP BY status`,
      params
    );
    return Object.values(ORDER_STATUS).map((status) => ({
      status,
      total: (rows.find((r) => r.status === status) || { total: 0 }).total,
    }));
  },

  /** THỐNG KÊ SẢN PHẨM BÁN CHẠY (theo số lượng, đơn đã giao). */
  async topProducts(limit, from, to) {
    const [rows] = await pool.query(
      `SELECT p.product_id, p.sku, p.name, c.name AS category,
              SUM(od.quantity) AS quantity_sold, SUM(od.quantity * od.unit_price) AS revenue
         FROM Order_Items od
         JOIN Orders o ON o.order_id = od.order_id
         JOIN Products p ON p.product_id = od.product_id
         JOIN Categories c ON c.category_id = p.category_id
        WHERE o.status = 'delivered' AND o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY p.product_id, p.sku, p.name, c.name
        ORDER BY quantity_sold DESC, revenue DESC
        LIMIT ?`,
      [from, to, limit]
    );
    return rows.map((r) => ({ ...r, quantity_sold: Number(r.quantity_sold), revenue: Number(r.revenue) }));
  },
};

module.exports = Stats;
