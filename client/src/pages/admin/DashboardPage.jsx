// Dashboard tổng quan — TV4 PHỤ TRÁCH
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, CalendarDays, Receipt, Clock3, Users, PackageX } from "lucide-react";
import { getOverview } from "../../api/admin";
import { ORDER_STATUS_LABELS } from "../../lib/constants";
import { formatMoney, formatDateTime } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";
import BarChart from "../../components/BarChart";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="admin-card admin-error">{error}</div>;
  if (!data) return <div className="admin-card">Đang tải...</div>;

  const { overview, statusCounts, recentOrders } = data;
  const cards = [
    { icon: Wallet, label: "Tổng doanh thu (đơn đã giao)", value: formatMoney(overview.revenue), tone: "red" },
    { icon: CalendarDays, label: "Doanh thu tháng này", value: formatMoney(overview.revenue_this_month), tone: "green" },
    { icon: Receipt, label: "Tổng số đơn", value: overview.total_orders },
    { icon: Clock3, label: "Đơn chờ xác nhận", value: overview.pending_orders, tone: "amber", to: "/admin/orders?status=pending" },
    { icon: Users, label: "Khách hàng", value: overview.customers, to: "/admin/accounts" },
    { icon: PackageX, label: "Sản phẩm sắp hết (≤ 5)", value: overview.low_stock, tone: "amber", to: "/admin/inventory" },
  ];

  return (
    <>
      <div className="kpi-grid">
        {cards.map(({ icon: Icon, label, value, tone, to }) => {
          const body = (
            <>
              <Icon size={22} />
              <span>{label}</span>
              <strong>{value}</strong>
            </>
          );
          return to ? (
            <Link key={label} to={to} className={`kpi-card ${tone || ""}`}>
              {body}
            </Link>
          ) : (
            <div key={label} className={`kpi-card ${tone || ""}`}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Số đơn theo trạng thái</h2>
            <Link to="/admin/reports">Xem báo cáo →</Link>
          </div>
          <BarChart horizontal data={statusCounts.map((s) => ({ label: ORDER_STATUS_LABELS[s.status], value: s.total }))} format={(v) => `${v} đơn`} />
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Đơn hàng mới nhất</h2>
            <Link to="/admin/orders">Tất cả →</Link>
          </div>
          <table className="admin-table compact">
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.order_id}>
                  <td>
                    <Link to={`/admin/orders?q=${o.order_id}`}>#{o.order_id}</Link>
                  </td>
                  <td>
                    {o.customer_name}
                    <small className="muted-line">{formatDateTime(o.created_at)}</small>
                  </td>
                  <td className="num">{formatMoney(o.total_amount)}</td>
                  <td>
                    <StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
