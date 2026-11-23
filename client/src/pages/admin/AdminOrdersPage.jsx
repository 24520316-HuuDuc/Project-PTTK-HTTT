// Xử lý đơn hàng — TV4 PHỤ TRÁCH (UC13 Xem, xác nhận, từ chối, cập nhật trạng thái; UC14 TÌM KIẾM đơn hàng)
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, Eye } from "lucide-react";
import { searchOrders, getOrder, updateOrderStatus } from "../../api/admin";
import {
  ORDER_STATUS_LABELS,
  STAFF_TRANSITIONS,
  ROLE_LABELS,
  ORDER_ACTION_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../lib/constants";
import { formatMoney, formatDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import StatusBadge from "../../components/StatusBadge";

function AdminOrdersPage() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ q: params.get("q") || "", status: params.get("status") || "", from: "", to: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await searchOrders(f);
      setOrders(data.orders);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = { q: params.get("q") || "", status: params.get("status") || "", from: "", to: "" };
    setFilters(initial);
    load(initial);
  }, [params, load]);

  /** Mở chi tiết: tải lại đơn để có lịch sử trạng thái */
  const openOrder = async (order) => {
    setSelected(order);
    try {
      const data = await getOrder(order.order_id);
      setSelected(data.order);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const changeStatus = async (order, status) => {
    let note = "";
    if (status === "rejected") {
      // Từ chối bắt buộc có lý do (khách sẽ thấy lý do này)
      const reason = window.prompt(`Lý do từ chối đơn #${order.order_id}:`, "");
      if (reason === null) return;
      if (!reason.trim()) return toast("Vui lòng nhập lý do từ chối.", "error");
      note = reason.trim();
    } else if (!window.confirm(`Chuyển đơn #${order.order_id} sang "${ORDER_STATUS_LABELS[status]}"?`)) {
      return;
    }
    setSaving(true);
    try {
      const data = await updateOrderStatus(order.order_id, status, note);
      toast(data.message);
      setSelected(data.order);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(filters);
        }}
      >
        <div className="admin-search">
          <Search size={17} />
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Mã đơn, tên khách, tên/SĐT người nhận"
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="date-field">
          Từ
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </label>
        <label className="date-field">
          Đến
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </label>
        <button className="btn-primary" type="submit">
          Tìm kiếm
        </button>
        <button
          className="btn-outline"
          type="button"
          onClick={() => {
            const empty = { q: "", status: "", from: "", to: "" };
            setFilters(empty);
            load(empty);
          }}
        >
          Xóa lọc
        </button>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Đơn hàng</h2>
          <span>{orders.length} kết quả</span>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Người nhận</th>
                <th>Ngày đặt</th>
                <th className="num">SL</th>
                <th className="num">Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="empty">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="empty">Không có đơn hàng phù hợp.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id}>
                    <td>#{o.order_id}</td>
                    <td>{o.customer_name}</td>
                    <td>
                      {o.receiver_name}
                      <small className="muted-line">{o.receiver_phone}</small>
                    </td>
                    <td>{formatDateTime(o.created_at)}</td>
                    <td className="num">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="num">{formatMoney(o.total_amount)}</td>
                    <td>
                      <StatusBadge kind="payment" status={o.payment_status} label={PAYMENT_STATUS_LABELS[o.payment_status]} />
                    </td>
                    <td>
                      <StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} />
                    </td>
                    <td className="actions">
                      <button type="button" className="btn-small" onClick={() => openOrder(o)}>
                        <Eye size={14} /> Xử lý
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>
                Đơn hàng #{selected.order_id} <StatusBadge status={selected.status} label={ORDER_STATUS_LABELS[selected.status]} />
              </h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <div className="info-grid">
              <span>Khách hàng</span>
              <strong>
                {selected.customer_name} ({selected.customer_email})
              </strong>
              <span>Người nhận</span>
              <strong>
                {selected.receiver_name} · {selected.receiver_phone}
              </strong>
              <span>Địa chỉ</span>
              <strong>{selected.shipping_address}</strong>
              {selected.note && (
                <>
                  <span>Ghi chú</span>
                  <strong>{selected.note}</strong>
                </>
              )}
              <span>Ngày đặt</span>
              <strong>{formatDateTime(selected.created_at)}</strong>
              <span>Thanh toán</span>
              <strong>
                {PAYMENT_METHOD_LABELS[selected.payment_method]} · {PAYMENT_STATUS_LABELS[selected.payment_status]}
              </strong>
              {selected.handled_by_name && (
                <>
                  <span>Nhân viên xử lý</span>
                  <strong>{selected.handled_by_name}</strong>
                </>
              )}
            </div>

            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th className="num">Đơn giá</th>
                  <th className="num">SL</th>
                  <th className="num">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((i) => (
                  <tr key={i.product_id}>
                    <td>
                      {i.name}
                      <small className="muted-line">{i.sku}</small>
                    </td>
                    <td className="num">{formatMoney(i.unit_price)}</td>
                    <td className="num">{i.quantity}</td>
                    <td className="num">{formatMoney(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="num">
                    <strong>Tổng cộng</strong>
                  </td>
                  <td className="num">
                    <strong>{formatMoney(selected.total_amount)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            {selected.history && (
              <>
                <h3>Lịch sử trạng thái</h3>
                <ol className="status-timeline">
                  {selected.history.map((h) => (
                    <li key={h.history_id}>
                      <StatusBadge status={h.to_status} label={ORDER_STATUS_LABELS[h.to_status]} />
                      <span>
                        {formatDateTime(h.changed_at)} · {h.changed_by_name} ({ROLE_LABELS[h.changed_by_role]})
                      </span>
                      {h.note && <em>{h.note}</em>}
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className="modal-actions">
              {!STAFF_TRANSITIONS[selected.status] ? (
                <span className="muted">
                  {selected.status === "pending" ? "" : "Đơn đã kết thúc, không thể đổi trạng thái."}
                </span>
              ) : (
                STAFF_TRANSITIONS[selected.status].map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={saving}
                    className={next === "rejected" ? "btn-danger" : "btn-primary"}
                    onClick={() => changeStatus(selected, next)}
                  >
                    {ORDER_ACTION_LABELS[next]}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminOrdersPage;
