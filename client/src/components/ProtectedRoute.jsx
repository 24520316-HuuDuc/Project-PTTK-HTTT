// Chặn trang theo vai trò — TV1 PHỤ TRÁCH
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * <ProtectedRoute roles={["manager"]}><Trang /></ProtectedRoute>
 * Không truyền roles = chỉ cần đăng nhập.
 */
function ProtectedRoute({ roles, children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <div className="page-loading">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page-forbidden">
        <h2>403 – Không có quyền truy cập</h2>
        <p>Tài khoản của bạn không được phép xem trang này.</p>
      </div>
    );
  }
  return children;
}

export default ProtectedRoute;
