// Thông tin cá nhân + đổi mật khẩu — TV1 PHỤ TRÁCH (UC03)
import { useState } from "react";
import { UserCircle, KeyRound } from "lucide-react";
import { updateProfile, changePassword } from "../../api/accounts";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../lib/constants";
import { formatDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user.full_name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim()) return toast("Vui lòng nhập họ tên.", "error");
    setSaving(true);
    try {
      const data = await updateProfile(profile);
      setUser(data.user);
      toast(data.message);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) return toast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
    if (pw.newPassword !== pw.confirmPassword) return toast("Mật khẩu nhập lại không khớp.", "error");
    try {
      const data = await changePassword(pw.currentPassword, pw.newPassword);
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast(data.message);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <main className="page-narrow">
      <header className="page-title">
        <span className="eyebrow">TÀI KHOẢN</span>
        <h1>Thông tin cá nhân</h1>
        <p>
          {user.email} · {ROLE_LABELS[user.role]} · Tham gia {formatDateTime(user.created_at).slice(0, 10)}
        </p>
      </header>

      <div className="profile-grid">
        <form className="panel" onSubmit={saveProfile}>
          <h2>
            <UserCircle size={19} /> Cập nhật thông tin
          </h2>
          <label>Họ và tên</label>
          <input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          <label>Số điện thoại</label>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <label>Địa chỉ</label>
          <textarea rows={3} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>

        <form className="panel" onSubmit={savePassword}>
          <h2>
            <KeyRound size={19} /> Đổi mật khẩu
          </h2>
          <label>Mật khẩu hiện tại</label>
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <label>Mật khẩu mới</label>
          <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <label>Nhập lại mật khẩu mới</label>
          <input type="password" value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
          <button className="btn-outline" type="submit">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </main>
  );
}

export default ProfilePage;
