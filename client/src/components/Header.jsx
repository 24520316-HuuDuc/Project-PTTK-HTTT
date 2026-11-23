// Thanh đầu trang phía khách — TV2 (giao diện), phần tài khoản dùng AuthContext của TV1
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, UserCircle, LayoutDashboard, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ROLE_LABELS } from "../lib/constants";

function Header() {
  const { user, isCustomer, isStaff, logout } = useAuth();
  const { count, setCartOpen } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => setSearch(params.get("q") || ""), [params]);

  // Bấm ra ngoài thì đóng menu tài khoản
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search.trim()) next.set("q", search.trim());
    else next.delete("q");
    navigate(`/?${next.toString()}#shop-products`);
    setTimeout(() => document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">HDX</span>
          <span>HDX Tech</span>
        </Link>

        <form className="search-box" onSubmit={handleSearch}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên, mã SKU, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" title="Tìm kiếm">
            Tìm
          </button>
        </form>

        <div className="header-actions">
          <div className="account-menu" ref={menuRef}>
            {user ? (
              <button type="button" className="account-button" onClick={() => setMenuOpen((v) => !v)}>
                <UserCircle size={21} />
                <span className="account-name">{user.full_name}</span>
              </button>
            ) : (
              <Link to="/login" className="account-button">
                <User size={21} />
                <span className="account-name">Đăng nhập</span>
              </Link>
            )}

            {user && menuOpen && (
              <div className="account-dropdown" onClick={() => setMenuOpen(false)}>
                <div className="account-dropdown-head">
                  <strong>{user.full_name}</strong>
                  <small>{ROLE_LABELS[user.role]}</small>
                </div>
                {isStaff && (
                  <Link to="/admin">
                    <LayoutDashboard size={16} /> Trang quản trị
                  </Link>
                )}
                {isCustomer && (
                  <Link to="/orders">
                    <Package size={16} /> Đơn hàng của tôi
                  </Link>
                )}
                <Link to="/profile">
                  <UserCircle size={16} /> Thông tin cá nhân
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>

          {!isStaff && (
            <button type="button" className="cart-button" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={21} />
              <span>Giỏ hàng</span>
              <b>{count}</b>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
