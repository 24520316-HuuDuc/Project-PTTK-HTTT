// Quản lý tài khoản nhân viên và khách hàng — TV1 PHỤ TRÁCH (UC04, chỉ Người quản lý)
// Tìm kiếm, xem chi tiết, tạo tài khoản nhân viên, sửa, đổi vai trò, khóa / mở khóa, đặt lại mật khẩu
import { useCallback, useEffect, useState } from "react";
import { Search, Lock, Unlock, X, UserPlus, Pencil, KeyRound } from "lucide-react";
import { searchUsers, getUser, createUser, updateUser, setUserStatus, resetUserPassword } from "../../api/accounts";
import { ROLE_LABELS, USER_STATUS_LABELS, ORDER_STATUS_LABELS } from "../../lib/constants";
import { formatMoney, formatDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

const EMPTY_FORM = { fullName: "", email: "", phone: "", address: "", password: "", role: "employee" };

function AdminAccountsPage() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState({ q: "", role: "", status: "" });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // { user, orders }
  const [editing, setEditing] = useState(null); // null | {} (tạo mới) | user (sửa)
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await searchUsers(f);
      setUsers(data.users);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ q: "", role: "", status: "" });
  }, [load]);

  const openDetail = async (id) => {
    try {
      setDetail(await getUser(id));
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const openCreate = () => {
    setEditing({});
    setForm(EMPTY_FORM);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ fullName: u.full_name, email: u.email, phone: u.phone || "", address: u.address || "", password: "", role: u.role });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const data = editing.user_id ? await updateUser(editing.user_id, form) : await createUser(form);
      toast(data.message);
      setEditing(null);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const toggleLock = async (u) => {
    const next = u.status === "active" ? "locked" : "active";
    if (!window.confirm(next === "locked" ? `Khóa tài khoản ${u.full_name}?` : `Mở khóa tài khoản ${u.full_name}?`)) return;
    try {
      const data = await setUserStatus(u.user_id, next);
      toast(data.message);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const resetPassword = async (u) => {
    const pw = window.prompt(`Mật khẩu mới cho ${u.full_name} (ít nhất 6 ký tự):`, "");
    if (pw === null) return;
    try {
      const data = await resetUserPassword(u.user_id, pw);
      toast(data.message);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const counts = users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }), {});

  return (
    <>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(filters);
        }}
      >
        <div className="admin-search">
          <Search size={17} />
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Tìm theo tên, email, số điện thoại" />
        </div>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">Mọi vai trò</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(USER_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="btn-primary" type="submit">
          Tìm kiếm
        </button>
        <button className="btn-primary toolbar-right" type="button" onClick={openCreate}>
          <UserPlus size={16} /> Tạo tài khoản nhân viên
        </button>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Tài khoản</h2>
          <span>
            {users.length} kết quả · {counts.manager || 0} quản lý · {counts.employee || 0} nhân viên · {counts.customer || 0} khách hàng
          </span>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th className="num">Số đơn</th>
                <th className="num">Đã mua</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="empty">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="empty">Không có tài khoản phù hợp.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id}>
                    <td>#{u.user_id}</td>
                    <td>
                      <button type="button" className="link-button" onClick={() => openDetail(u.user_id)}>
                        {u.full_name}
                      </button>
                      {u.user_id === me.user_id && <small className="muted-line">(bạn)</small>}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "—"}</td>
                    <td>
                      <StatusBadge kind="role" status={u.role} label={ROLE_LABELS[u.role]} />
                    </td>
                    <td className="num">{u.role === "customer" ? u.order_count : "—"}</td>
                    <td className="num">{u.role === "customer" ? formatMoney(u.total_spent) : "—"}</td>
                    <td>
                      <StatusBadge kind="user" status={u.status} label={USER_STATUS_LABELS[u.status]} />
                    </td>
                    <td className="actions">
                      {u.role !== "customer" && (
                        <button type="button" className="btn-icon" title="Sửa" onClick={() => openEdit(u)}>
                          <Pencil size={15} />
                        </button>
                      )}
                      <button type="button" className="btn-icon" title="Đặt lại mật khẩu" onClick={() => resetPassword(u)}>
                        <KeyRound size={15} />
                      </button>
                      {u.user_id !== me.user_id && (
                        <button
                          type="button"
                          className={`btn-icon ${u.status === "active" ? "danger" : ""}`}
                          title={u.status === "active" ? "Khóa" : "Mở khóa"}
                          onClick={() => toggleLock(u)}
                        >
                          {u.status === "active" ? <Lock size={15} /> : <Unlock size={15} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className="modal-head">
              <h2>{editing.user_id ? `Sửa tài khoản: ${editing.full_name}` : "Tạo tài khoản nhân viên"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <label className="span-2">
                Họ và tên *
                <input value={form.fullName} onChange={set("fullName")} />
              </label>
              <label>
                Email *
                <input type="email" value={form.email} onChange={set("email")} disabled={Boolean(editing.user_id)} />
              </label>
              <label>
                Số điện thoại
                <input value={form.phone} onChange={set("phone")} />
              </label>
              <label className="span-2">
                Địa chỉ
                <input value={form.address} onChange={set("address")} />
              </label>
              <label>
                Vai trò
                <select value={form.role} onChange={set("role")} disabled={editing.user_id === me.user_id}>
                  <option value="employee">Nhân viên</option>
                  <option value="manager">Người quản lý</option>
                </select>
              </label>
              {!editing.user_id && (
                <label>
                  Mật khẩu *
                  <input type="password" value={form.password} onChange={set("password")} placeholder="Ít nhất 6 ký tự" />
                </label>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                {editing.user_id ? "Lưu thay đổi" : "Tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>
                {detail.user.full_name} <StatusBadge kind="role" status={detail.user.role} label={ROLE_LABELS[detail.user.role]} />
              </h2>
              <button type="button" onClick={() => setDetail(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <div className="info-grid">
              <span>Email</span><strong>{detail.user.email}</strong>
              <span>Điện thoại</span><strong>{detail.user.phone || "—"}</strong>
              <span>Địa chỉ</span><strong>{detail.user.address || "—"}</strong>
              <span>Ngày tạo</span><strong>{formatDateTime(detail.user.created_at)}</strong>
              <span>Trạng thái</span><strong>{USER_STATUS_LABELS[detail.user.status]}</strong>
            </div>
            {detail.user.role === "customer" && (
              <>
                <h3>Lịch sử đơn hàng ({detail.orders.length})</h3>
                <table className="admin-table compact">
                  <thead>
                    <tr><th>Mã đơn</th><th>Ngày đặt</th><th className="num">Tổng tiền</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    {detail.orders.length === 0 ? (
                      <tr><td colSpan={4} className="empty">Chưa có đơn hàng.</td></tr>
                    ) : (
                      detail.orders.map((o) => (
                        <tr key={o.order_id}>
                          <td>#{o.order_id}</td>
                          <td>{formatDateTime(o.created_at)}</td>
                          <td className="num">{formatMoney(o.total_amount)}</td>
                          <td><StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAccountsPage;
