// Bản đồ trang (routes) — PHẦN CHUNG
import { Navigate, Route, Routes } from "react-router-dom";

import ShopLayout from "./layouts/ShopLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastHost from "./components/ToastHost";

// TV1
import LoginPage from "./pages/accounts/LoginPage";
import RegisterPage from "./pages/accounts/RegisterPage";
import ProfilePage from "./pages/accounts/ProfilePage";
import AdminAccountsPage from "./pages/accounts/AdminAccountsPage";
// TV2
import HomePage from "./pages/products/HomePage";
import AdminProductsPage from "./pages/products/AdminProductsPage";
import AdminCategoriesPage from "./pages/products/AdminCategoriesPage";
import InventoryPage from "./pages/products/InventoryPage";
// TV3
import MyOrdersPage from "./pages/shopping/MyOrdersPage";
// TV4
import DashboardPage from "./pages/admin/DashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import { useAuth } from "./context/AuthContext";

import "./App.css";
import "./styles/common.css";

/** /admin: Quản lý vào Dashboard, Nhân viên vào thẳng Đơn hàng */
function AdminHome() {
  const { isManager } = useAuth();
  return isManager ? <DashboardPage /> : <Navigate to="/admin/orders" replace />;
}

function App() {
  return (
    <>
      <Routes>
        {/* Trang đăng nhập / đăng ký (TV1) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Phía khách hàng */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["customer"]}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Phía quản trị */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["employee", "manager"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          {/* Nhân viên + Quản lý */}
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          {/* Chỉ Người quản lý */}
          <Route path="accounts" element={<ProtectedRoute roles={["manager"]}><AdminAccountsPage /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={["manager"]}><ReportsPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  );
}

export default App;
