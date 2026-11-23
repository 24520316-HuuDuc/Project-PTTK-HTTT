// Đăng ký tài khoản khách hàng — TV1 PHỤ TRÁCH (UC01)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/accounts";
import { toast } from "../../lib/toast";
import "../../styles/auth.css";

const EMPTY = { fullName: "", email: "", phone: "", address: "", password: "", confirmPassword: "" };

function validate(f) {
  const errors = {};
  if (!f.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "Email không hợp lệ.";
  if (f.phone && !/^(0|\+84)[0-9]{9,10}$/.test(f.phone.trim())) errors.phone = "Số điện thoại không hợp lệ.";
  if (f.password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  if (f.confirmPassword !== f.password) errors.confirmPassword = "Mật khẩu nhập lại không khớp.";
  return errors;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      toast(data.message);
      navigate("/login");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text", placeholder = "") => (
    <>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} placeholder={placeholder} />
      {errors[name] && <div className="entry-error">{errors[name]}</div>}
    </>
  );

  return (
    <div className="entry-screen">
      <form className="entry-card auth-card auth-card-wide" onSubmit={handleSubmit} noValidate>
        <Link to="/" className="entry-logo">
          HDX
        </Link>
        <h1>Đăng ký tài khoản</h1>
        <p>Tạo tài khoản để mua sắm và theo dõi đơn hàng</p>

        {field("fullName", "Họ và tên *", "text", "Nguyễn Văn A")}
        <div className="auth-row">
          <div>{field("email", "Email *", "email", "email@vidu.com")}</div>
          <div>{field("phone", "Số điện thoại", "tel", "0901234567")}</div>
        </div>
        {field("address", "Địa chỉ", "text", "Số nhà, đường, phường, quận")}
        <div className="auth-row">
          <div>{field("password", "Mật khẩu *", "password", "Ít nhất 6 ký tự")}</div>
          <div>{field("confirmPassword", "Nhập lại mật khẩu *", "password")}</div>
        </div>

        {apiError && <div className="entry-error">{apiError}</div>}

        <button className="entry-submit" type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
