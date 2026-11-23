// Đăng nhập — TV1 PHỤ TRÁCH (UC02)
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const SAMPLE_ACCOUNTS = [
  ["Quản lý", "admin@hdxtech.vn"],
  ["Nhân viên", "nhanvien@hdxtech.vn"],
  ["Khách hàng", "an@gmail.com"],
];

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === "customer" ? "/" : "/admin"} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      // Nhân viên/quản lý -> trang quản trị; khách -> trang trước đó
      navigate(loggedIn.role === "customer" ? location.state?.from || "/" : "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entry-screen">
      <form className="entry-card auth-card" onSubmit={handleSubmit} noValidate>
        <Link to="/" className="entry-logo">
          HDX
        </Link>
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn quay lại HDX Tech</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@vidu.com"
          autoComplete="username"
        />

        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
        />

        {error && <div className="entry-error">{error}</div>}

        <button className="entry-submit" type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        <div className="auth-samples">
          <span>Tài khoản mẫu (mật khẩu 123456):</span>
          {SAMPLE_ACCOUNTS.map(([label, email]) => (
            <button type="button" key={email} onClick={() => setForm({ email, password: "123456" })}>
              {label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
