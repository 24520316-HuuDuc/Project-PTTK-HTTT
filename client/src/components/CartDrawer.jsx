// Ngăn kéo giỏ hàng — TV3 PHỤ TRÁCH (UC09: thêm/xóa, cập nhật số lượng, tính tổng tiền)
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProductImage } from "../lib/anh";
import { formatMoney } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function CartDrawer() {
  const { user } = useAuth();
  const { items, count, total, update, remove, setCartOpen, setCheckoutOpen } = useCart();
  const close = () => setCartOpen(false);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="cart-overlay" onClick={close}>
      <div className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="cart-header">
          <div>
            <h2>Giỏ hàng của bạn</h2>
            <span>{count} sản phẩm</span>
          </div>
          <button type="button" onClick={close} aria-label="Đóng giỏ hàng">
            <X />
          </button>
        </div>

        {!user ? (
          <div className="cart-empty">
            <ShoppingBag size={55} />
            <h3>Bạn chưa đăng nhập</h3>
            <p>Đăng nhập để thêm sản phẩm vào giỏ và đặt hàng.</p>
            <Link to="/login" className="cart-login-link" onClick={close}>
              Đăng nhập
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={55} />
            <h3>Giỏ hàng đang trống</h3>
            <p>Hãy khám phá các sản phẩm tại HDX Tech nhé!</p>
            <button type="button" onClick={close}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.product_id}>
                  <div className="cart-item-image">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = getProductImage({});
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-sku">{item.sku}</p>
                    <strong>{formatMoney(item.price)}</strong>
                    {(item.status !== "active" || item.category_status !== "active") && (
                      <p className="field-error">Sản phẩm đã ngừng kinh doanh, vui lòng xóa khỏi giỏ</p>
                    )}
                    {item.quantity > item.stock && (
                      <p className="field-error">Chỉ còn {item.stock} sản phẩm</p>
                    )}

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => update(item.product_id, item.quantity - 1)}
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => update(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => remove(item.product_id)}
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Tạm tính</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <button type="button" className="checkout-button" onClick={handleCheckout}>
                Tiến hành đặt hàng
                <ArrowRight size={18} />
              </button>
              <p className="cart-note">Giỏ hàng được lưu theo tài khoản của bạn.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
