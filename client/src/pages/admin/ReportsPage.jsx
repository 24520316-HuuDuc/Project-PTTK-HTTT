// Báo cáo thống kê — TV4 PHỤ TRÁCH
// UC15 Thống kê doanh thu theo ngày/tháng, UC16 Thống kê sản phẩm bán chạy, + số lượng đơn theo trạng thái
import { useEffect, useState } from "react";
import { getRevenue, getTopProducts, getOrderStatusStats } from "../../api/admin";
import { ORDER_STATUS_LABELS } from "../../lib/constants";
import { formatMoney, daysAgo, toInputDate } from "../../lib/format";
import { toast } from "../../lib/toast";
import BarChart from "../../components/BarChart";

const TABS = [
  { key: "revenue", label: "Doanh thu" },
  { key: "top", label: "Sản phẩm bán chạy" },
  { key: "status", label: "Số lượng đơn hàng" },
];

function ReportsPage() {
  const [tab, setTab] = useState("revenue");
  const [range, setRange] = useState({ from: daysAgo(29), to: toInputDate(new Date()) });
  const [mode, setMode] = useState("day");
  const [year, setYear] = useState(new Date().getFullYear());
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm thường (không useCallback) để luôn đọc giá trị bộ lọc mới nhất
  const run = async () => {
    setLoading(true);
    try {
      if (tab === "revenue") setResult({ tab, ...(await getRevenue(mode === "month" ? { mode, year } : { mode, ...range })) });
      if (tab === "top") setResult({ tab, ...(await getTopProducts({ ...range, limit })) });
      if (tab === "status") setResult({ tab, ...(await getOrderStatusStats(range)) });
    } catch (err) {
      toast(err.message, "error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Tự chạy khi đổi tab hoặc đổi kiểu thống kê ngày/tháng
  useEffect(() => {
    setResult(null);
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, mode]);

  // Chỉ hiển thị kết quả đúng của tab đang mở
  const current = result?.tab === tab ? result : null;
  const rows = current?.rows || [];

  return (
    <>
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        {tab === "revenue" && (
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
          </select>
        )}
        {tab === "revenue" && mode === "month" ? (
          <label className="date-field">
            Năm
            <input type="number" value={year} min="2020" max="2100" onChange={(e) => setYear(e.target.value)} />
          </label>
        ) : (
          <>
            <label className="date-field">
              Từ
              <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            </label>
            <label className="date-field">
              Đến
              <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
            </label>
          </>
        )}
        {tab === "top" && (
          <label className="date-field">
            Top
            <input type="number" value={limit} min="1" max="50" onChange={(e) => setLimit(e.target.value)} />
          </label>
        )}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Đang tải..." : "Xem báo cáo"}
        </button>
      </form>

      {tab === "revenue" && current && (
        <>
          <div className="kpi-grid kpi-grid-3">
            <div className="kpi-card red">
              <span>Tổng doanh thu</span>
              <strong>{formatMoney(current.total)}</strong>
            </div>
            <div className="kpi-card">
              <span>Số đơn đã giao</span>
              <strong>{rows.reduce((s, r) => s + r.orders, 0)}</strong>
            </div>
            <div className="kpi-card">
              <span>Trung bình / đơn</span>
              <strong>{formatMoney(Math.round(current.total / Math.max(rows.reduce((s, r) => s + r.orders, 0), 1)))}</strong>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-card-head">
              <h2>Doanh thu {mode === "month" ? `từng tháng năm ${current.year}` : `từ ${current.from} đến ${current.to}`}</h2>
              <span>Chỉ tính đơn đã giao</span>
            </div>
            <BarChart data={rows.map((r) => ({ label: r.label, value: r.revenue, extra: `${r.orders} đơn` }))} format={formatMoney} />
          </div>
          <div className="admin-card">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>{mode === "month" ? "Tháng" : "Ngày"}</th>
                  <th className="num">Số đơn</th>
                  <th className="num">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => r.orders > 0)
                  .map((r) => (
                    <tr key={r.key}>
                      <td>{r.label}</td>
                      <td className="num">{r.orders}</td>
                      <td className="num">{formatMoney(r.revenue)}</td>
                    </tr>
                  ))}
                {rows.every((r) => r.orders === 0) && (
                  <tr><td colSpan={3} className="empty">Không có đơn đã giao trong khoảng này.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "top" && current && (
        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-head">
              <h2>Top {current.limit} sản phẩm bán chạy</h2>
              <span>Theo số lượng bán (đơn đã giao)</span>
            </div>
            <BarChart horizontal data={rows.map((r) => ({ label: r.name, value: r.quantity_sold }))} format={(v) => `${v} cái`} />
          </div>
          <div className="admin-card">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th className="num">Đã bán</th>
                  <th className="num">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={4} className="empty">Chưa có sản phẩm nào được bán.</td></tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.product_id}>
                      <td>{i + 1}</td>
                      <td>
                        {r.name}
                        <small className="muted-line">
                          {r.sku} · {r.category}
                        </small>
                      </td>
                      <td className="num">{r.quantity_sold}</td>
                      <td className="num">{formatMoney(r.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "status" && current && (
        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-head">
              <h2>Số đơn theo trạng thái</h2>
              <span>
                {current.from} → {current.to}
              </span>
            </div>
            <BarChart horizontal data={rows.map((r) => ({ label: ORDER_STATUS_LABELS[r.status], value: r.total }))} format={(v) => `${v} đơn`} />
          </div>
          <div className="admin-card">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Trạng thái</th>
                  <th className="num">Số đơn</th>
                  <th className="num">Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const sum = rows.reduce((s, x) => s + x.total, 0) || 1;
                  return (
                    <tr key={r.status}>
                      <td>{ORDER_STATUS_LABELS[r.status]}</td>
                      <td className="num">{r.total}</td>
                      <td className="num">{Math.round((r.total / sum) * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportsPage;
