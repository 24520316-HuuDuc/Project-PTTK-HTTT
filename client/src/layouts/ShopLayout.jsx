// Khung trang phía khách: dải trên cùng, header, menu, footer, giỏ hàng, đặt hàng — TV2 (giao diện chung)
import { NavLink, Outlet } from "react-router-dom";
import { Zap, Truck, ShoppingBag, Store } from "lucide-react";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import Checkout from "../components/Checkout";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ShopLayout() {
  const { isCustomer, isStaff } = useAuth();
  const { isCartOpen, isCheckoutOpen } = useCart();

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-inner">
          <span>
            <Zap size={14} />
            Ưu đãi công nghệ mỗi ngày tại HDX Tech
          </span>
          <span>
            <Truck size={14} />
            Giao hàng nhanh khu vực TP.HCM
          </span>
        </div>
      </div>

      <Header />

      <nav className="customer-navigation">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          <ShoppingBag size={16} />
          Trang chủ
        </NavLink>
        {isCustomer && (
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            <Truck size={16} />
            Đơn hàng của tôi
          </NavLink>
        )}
        {isStaff && (
          <NavLink to="/admin">
            <Store size={16} />
            Trang quản trị
          </NavLink>
        )}
      </nav>

      <Outlet />

      <footer className="shop-footer shop-footer-wide">
        <div className="footer-brand">
          <span className="footer-logo">HDX</span>
          <div>
            <strong>HDX Tech</strong>
            <p>Hệ thống bán hàng công nghệ trực tuyến — Đồ án PTTK HTTT, UIT.</p>
          </div>
        </div>
        <span>© 2026 HDX Tech.</span>
      </footer>

      {isCartOpen && <CartDrawer />}
      {isCheckoutOpen && <Checkout />}
    </>
  );
}

export default ShopLayout;
