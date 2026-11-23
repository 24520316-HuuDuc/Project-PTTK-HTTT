// Khung trang quản trị (menu bên trái) — TV4 PHỤ TRÁCH
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Receipt, Package, Tags, Warehouse, Users, BarChart3, Store, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../lib/constants";
import "../styles/admin.css";

// Người quản lý có toàn bộ quyền của Nhân viên + tài khoản + thống kê
const MENU = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, managerOnly: true }, // TV4
  { to: "/admin/orders", label: "Đơn hàng", icon: Receipt }, // TV4
  { to: "/admin/products", label: "Sản phẩm", icon: Package }, // TV2
  { to: "/admin/categories", label: "Danh mục", icon: Tags }, // TV2
  { to: "/admin/inventory", label: "Kho hàng", icon: Warehouse }, // TV2
  { to: "/admin/accounts", label: "Tài khoản", icon: Users, managerOnly: true }, // TV1
  { to: "/admin/reports", label: "Báo cáo thống kê", icon: BarChart3, managerOnly: true }, // TV4
];

function AdminLayout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = MENU.filter((m) => isManager || !m.managerOnly);
  const current = MENU.find((m) => (m.end ? pathname === m.to : pathname.startsWith(m.to)));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-logo">HDX</span>
          <span>Quản trị</span>
        </Link>
        <nav>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/">
            <Store size={18} /> Xem cửa hàng
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{current?.label || "Quản trị"}</h1>
          <span>
            {user.full_name} · {ROLE_LABELS[user.role]}
          </span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
