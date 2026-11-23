// Form đặt hàng, thanh toán COD — TV3 PHỤ TRÁCH (UC10 Đặt hàng)
import { useState } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, User, Phone, CreditCard, Banknote, CheckCircle, Package } from "lucide-react";
import { placeOrder } from "../api/shopping";
import { getProductImage } from "../lib/anh";
import { formatMoney } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Checkout() {
  const { user } = useAuth();
  const { items, total, reload, setCheckoutOpen } = useCart();
  const onClose = () => setCheckoutOpen(false);

  // Điền sẵn thông tin từ tài khoản
  const [customer, setCustomer] = useState({
    fullName: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
    payment: "COD",
  });
  const [errors, setErrors] = useState({});
  const [orderData, setOrderData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const newErrors = {};
    if (!customer.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(customer.phone.trim())) newErrors.phone = "Số điện thoại chưa hợp lệ.";
    if (!customer.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ nhận hàng.";
    if (items.length === 0) newErrors.cart = "Giỏ hàng đang trống.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setApiError("");
      const result = await placeOrder({
        receiverName: customer.fullName.trim(),
        receiverPhone: customer.phone.trim(),
        shippingAddress: customer.address.trim(),
        note: customer.note.trim(),
      });
      setOrderData({ orderId: result.order_id, total: result.total_amount });
      reload(); // giỏ đã được xóa trên server
    } catch (error) {
      setApiError(error.message || "Không thể đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderData) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-modal order-success">
          <div className="checkout-success-icon">
            <CheckCircle size={54} />
          </div>
          <h2>Đặt hàng thành công!</h2>
          <p>Cảm ơn bạn đã mua sắm tại HDX Tech.</p>
          <div className="order-code">
            <span>MÃ ĐƠN HÀNG</span>
            <strong>#{orderData.orderId}</strong>
          </div>
          <div className="success-info">
            <Package size={20} />
            <span>Tổng tiền: {formatMoney(orderData.total)}</span>
          </div>
          <Link to="/orders" className="checkout-submit checkout-link" onClick={onClose}>
            Xem đơn hàng của tôi
          </Link>
          <button type="button" className="checkout-back" onClick={onClose}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
        <div className="checkout-header">
          <div>
            <span className="checkout-eyebrow">HDX TECH STORE</span>
            <h2>Thông tin đặt hàng</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" disabled={submitting}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-content">
            <section className="checkout-form-section">
              <h3>
                <MapPin size={19} />
                Thông tin nhận hàng
              </h3>

              <label>Họ và tên *</label>
              <div className="checkout-input">
                <User size={18} />
                <input name="fullName" value={customer.fullName} onChange={updateField} placeholder="Nhập họ và tên người nhận" />
              </div>
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}

              <label>Số điện thoại *</label>
              <div className="checkout-input">
                <Phone size={18} />
                <input name="phone" value={customer.phone} onChange={updateField} placeholder="Nhập số điện thoại" inputMode="tel" />
              </div>
              {errors.phone && <p className="field-error">{errors.phone}</p>}

              <label>Địa chỉ nhận hàng *</label>
              <textarea
                name="address"
                value={customer.address}
                onChange={updateField}
                placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                rows={3}
              />
              {errors.address && <p className="field-error">{errors.address}</p>}

              <label>Ghi chú đơn hàng</label>
              <textarea
                name="note"
                value={customer.note}
                onChange={updateField}
                placeholder="Ghi chú thêm cho người bán (nếu có)"
                rows={2}
              />

              <h3 className="payment-title">
                <CreditCard size={19} />
                Phương thức thanh toán
              </h3>

              <label className="payment-option">
                <input type="radio" name="payment" value="COD" checked={customer.payment === "COD"} onChange={updateField} />
                <Banknote size={20} />
                <span>
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <small>Cửa hàng chỉ hỗ trợ thanh toán tiền mặt khi nhận hàng</small>
                </span>
              </label>

            </section>

            <aside className="checkout-summary">
              <h3>Đơn hàng của bạn</h3>
              <div className="checkout-products">
                {items.map((item) => (
                  <div className="checkout-product" key={item.product_id}>
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getProductImage({});
                      }}
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span>Số lượng: {item.quantity}</span>
                      <b>{formatMoney(item.price * item.quantity)}</b>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-line">
                <span>Tạm tính</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <div className="summary-line">
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </div>
              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <p className="checkout-disclaimer">
                Bạn thanh toán bằng tiền mặt khi nhận hàng (COD).
              </p>
            </aside>
          </div>

          {errors.cart && <p className="field-error">{errors.cart}</p>}
          {apiError && <p className="field-error">{apiError}</p>}

          <div className="checkout-footer">
            <button type="button" className="checkout-back" onClick={onClose} disabled={submitting}>
              Quay lại
            </button>
            <button type="submit" className="checkout-submit" disabled={submitting}>
              {submitting ? "Đang gửi đơn hàng..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
