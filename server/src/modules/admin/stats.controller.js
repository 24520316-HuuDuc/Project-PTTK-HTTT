// =====================================================================
// Control: Dashboard & báo cáo thống kê — TV4 PHỤ TRÁCH
// UC15 THỐNG KÊ doanh thu, UC16 THỐNG KÊ sản phẩm bán chạy (+ số lượng đơn theo trạng thái)
// =====================================================================
const Stats = require('./stats.model');
const AdminOrder = require('./admin-order.model');
const { HttpError, isDate } = require('../../utils/http');

const toISO = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => toISO(new Date(Date.now() - n * 864e5));

/** Đọc khoảng ngày từ query, mặc định 30 ngày gần nhất. */
function readRange(query) {
  const from = isDate(query.from) ? query.from : daysAgo(29);
  const to = isDate(query.to) ? query.to : toISO(new Date());
  if (from > to) throw new HttpError(400, '"Từ ngày" phải trước "Đến ngày".');
  return { from, to };
}

/** GET /api/admin/stats/overview — Dashboard */
exports.overview = async (req, res) => {
  const [overview, statusCounts, recentOrders] = await Promise.all([
    Stats.overview(),
    Stats.orderCountByStatus(),
    AdminOrder.search({ limit: 6 }),
  ]);
  res.json({ overview, statusCounts, recentOrders });
};

/** GET /api/admin/stats/revenue?mode=day&from=&to=  |  ?mode=month&year= */
exports.revenue = async (req, res) => {
  if (req.query.mode === 'month') {
    const year = Number(req.query.year) || new Date().getFullYear();
    const rows = await Stats.revenueByMonth(year);
    return res.json({ mode: 'month', year, rows, total: rows.reduce((s, r) => s + r.revenue, 0) });
  }
  const { from, to } = readRange(req.query);
  const rows = await Stats.revenueByDay(from, to);
  return res.json({ mode: 'day', from, to, rows, total: rows.reduce((s, r) => s + r.revenue, 0) });
};

/** GET /api/admin/stats/order-status?from=&to= */
exports.orderStatus = async (req, res) => {
  const { from, to } = readRange(req.query);
  res.json({ from, to, rows: await Stats.orderCountByStatus(from, to) });
};

/** GET /api/admin/stats/top-products?from=&to=&limit= */
exports.topProducts = async (req, res) => {
  const { from, to } = readRange(req.query);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  res.json({ from, to, limit, rows: await Stats.topProducts(limit, from, to) });
};
