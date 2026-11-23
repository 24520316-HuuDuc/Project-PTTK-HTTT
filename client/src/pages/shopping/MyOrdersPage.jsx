// Đơn hàng của tôi — TV3 PHỤ TRÁCH (UC11 Xem lịch sử & trạng thái đơn, UC12 Hủy đơn khi Chờ xác nhận)
import { useCallback, useEffect, useState } from "react";
import { Package, RefreshCw, Truck, CheckCircle2, Clock3, AlertCircle, XCircle, CreditCard } from "lucide-react";
import { getMyOrders, cancelMyOrder } from "../../api/shopping";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "../../lib/constants";
import { formatMoney, formatDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import "./MyOrdersPage.css";

// Các bước hiển thị trên thanh tiến trình (khớp State Diagram đơn hàng)
const STEPS = [
  { key: "pending", label: "Đã đặt hàng" },
  { key: "confirmed", label: "Shop xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
];

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const data = await getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      setError(err.message || "Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (order) => {
    const reason = window.prompt(`Hủy đơn hàng #${order.order_id}? Lý do hủy (có thể để trống):`, "");
    if (reason === null) return; // bấm Cancel
    try {
      const data = await cancelMyOrder(order.order_id, reason.trim());
      toast(data.message);
      fetchOrders();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const processing = orders.filter((o) => ["pending", "confirmed", "shipping"].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "delivered").length;

  return (
    <main className="my-orders-page">
      <header className="orders-heading">
        <div>
          <span className="orders-eyebrow">HDX TECH STORE</span>
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi tình trạng các đơn hàng của bạn</p>
        </div>
        <button className="orders-refresh" type="button" onClick={fetchOrders} title="Tải lại đơn hàng" disabled={loading}>
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="orders-summary">
        <div>
          <Package size={21} />
          <strong>{orders.length}</strong>
          <span>Tổng đơn hàng</span>
        </div>
        <div>
          <Clock3 size={21} />
          <strong>{processing}</strong>
          <span>Đang xử lý</span>
        </div>
        <div>
          <CheckCircle2 size={21} />
          <strong>{completed}</strong>
          <span>Đã hoàn tất</span>
        </div>
      </div>

      {loading ? (
        <div className="orders-message">
          <RefreshCw className="orders-spin" size={30} />
          <h3>Đang tải đơn hàng...</h3>
        </div>
      ) : error ? (
        <div className="orders-message">
          <AlertCircle size={36} />
          <h3>Không thể tải đơn hàng</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchOrders}>
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-message">
          <Package size={48} />
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Những đơn hàng đã đặt thành công sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <section className="orders-list">
          {orders.map((order) => {
            const cancelled = order.status === "cancelled" || order.status === "rejected";
            // Lý do hủy / từ chối lấy từ lịch sử trạng thái
            const endNote = cancelled ? order.history?.find((h) => h.to_status === order.status)?.note : null;
            const step = STEPS.findIndex((s) => s.key === order.status);

            return (
              <article className="order-card" key={order.order_id}>
                <div className="order-card-heading">
                  <div>
                    <span>MÃ ĐƠN HÀNG · {formatDateTime(order.created_at)}</span>
                    <strong>#{order.order_id}</strong>
                  </div>
                  <span className={`order-status ${cancelled ? "cancelled" : ""}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item" key={item.product_id}>
                      <span>{item.name}</span>
                      <span>
                        x{item.quantity} · {formatMoney(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Tổng thanh toán</span>
                  <strong>{formatMoney(order.total_amount)}</strong>
                </div>

                {cancelled && (
                  <div className="order-reason">
                    <XCircle size={18} />
                    <span>
                      {order.status === "rejected" ? "Cửa hàng đã từ chối đơn" : "Đơn đã được hủy"}
                      {endNote ? `: ${endNote}` : ""}
                    </span>
                  </div>
                )}

                {!cancelled && (
                  <div className="order-progress">
                    {STEPS.map((item, index) => (
                      <div className={`progress-step ${index <= step ? "completed" : ""}`} key={item.key}>
                        <span className="progress-dot">{index < step ? <CheckCircle2 size={15} /> : index + 1}</span>
                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-tracking">
                  <Truck size={19} />
                  <div>
                    <span>Giao đến</span>
                    <strong>
                      {order.receiver_name} · {order.receiver_phone} — {order.shipping_address}
                    </strong>
                  </div>
                </div>

                <div className="order-tracking">
                  <CreditCard size={19} />
                  <div>
                    <span>Thanh toán</span>
                    <strong>
                      {PAYMENT_METHOD_LABELS[order.payment_method]} · {PAYMENT_STATUS_LABELS[order.payment_status]}
                    </strong>
                  </div>
                </div>

                {order.status === "pending" && (
                  <button className="order-chat-button" type="button" onClick={() => handleCancel(order)}>
                    <XCircle size={17} />
                    Hủy đơn hàng
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyOrdersPage;
