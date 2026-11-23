// Quản lý kho: theo dõi và cập nhật số lượng tồn kho — TV2 PHỤ TRÁCH
// Tồn kho tự trừ khi khách đặt hàng, tự cộng lại khi đơn bị hủy / từ chối.
import { useCallback, useEffect, useState } from "react";
import { Search, PackagePlus, ClipboardCheck, X } from "lucide-react";
import { getInventory, updateInventory, adminGetCategories } from "../../api/products";
import { LOW_STOCK, PRODUCT_STATUS_LABELS } from "../../lib/constants";
import { formatDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import StatusBadge from "../../components/StatusBadge";

function InventoryPage() {
  const [filters, setFilters] = useState({ q: "", category: "", lowOnly: false });
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { item, mode: 'add' | 'set' }
  const [amount, setAmount] = useState("");

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await getInventory({ q: f.q, category: f.category, low: f.lowOnly ? LOW_STOCK : "" });
      setItems(data.items);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ q: "", category: "", lowOnly: false });
    adminGetCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, [load]);

  const open = (item, mode) => {
    setEditing({ item, mode });
    setAmount(mode === "set" ? String(item.quantity) : "");
  };

  const save = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 0 || (editing.mode === "add" && n === 0)) {
      return toast("Vui lòng nhập số lượng hợp lệ.", "error");
    }
    try {
      const data = await updateInventory(editing.item.product_id, editing.mode, n);
      toast(data.message);
      setEditing(null);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const lowCount = items.filter((i) => i.status === "active" && i.quantity <= LOW_STOCK).length;
  const total = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Số mặt hàng</span>
          <strong>{items.length}</strong>
        </div>
        <div className="kpi-card">
          <span>Tổng số lượng tồn</span>
          <strong>{total}</strong>
        </div>
        <div className="kpi-card amber">
          <span>Sắp hết hàng (≤ {LOW_STOCK})</span>
          <strong>{lowCount}</strong>
        </div>
      </div>

      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(filters);
        }}
      >
        <div className="admin-search">
          <Search size={17} />
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Tên hoặc mã SKU" />
        </div>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Mọi danh mục</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="check-field">
          <input type="checkbox" checked={filters.lowOnly} onChange={(e) => setFilters({ ...filters, lowOnly: e.target.checked })} />
          Chỉ hàng sắp hết
        </label>
        <button className="btn-primary" type="submit">
          Lọc
        </button>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Tồn kho</h2>
          <span>"Đang giữ" = số lượng nằm trong đơn chờ xác nhận / đã xác nhận (đã trừ khỏi kho)</span>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th className="num">Tồn kho</th>
                <th className="num">Đang giữ</th>
                <th>Cập nhật gần nhất</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="empty">Không có sản phẩm phù hợp.</td></tr>
              ) : (
                items.map((i) => (
                  <tr key={i.product_id} className={i.status !== "active" ? "row-muted" : ""}>
                    <td>{i.sku}</td>
                    <td>{i.name}</td>
                    <td>{i.category}</td>
                    <td>
                      <StatusBadge kind="product" status={i.status} label={PRODUCT_STATUS_LABELS[i.status]} />
                    </td>
                    <td className={`num ${i.quantity <= LOW_STOCK ? "text-warn" : ""}`}>
                      <strong>{i.quantity}</strong>
                    </td>
                    <td className="num">{i.reserved}</td>
                    <td>
                      {formatDateTime(i.updated_at)}
                      <small className="muted-line">{i.updated_by_name}</small>
                    </td>
                    <td className="actions">
                      <button type="button" className="btn-small" onClick={() => open(i, "add")}>
                        <PackagePlus size={14} /> Nhập thêm
                      </button>
                      <button type="button" className="btn-small" onClick={() => open(i, "set")}>
                        <ClipboardCheck size={14} /> Kiểm kê
                      </button>
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
              <h2>{editing.mode === "add" ? "Nhập thêm hàng" : "Kiểm kê tồn kho"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <div className="info-grid">
              <span>Sản phẩm</span>
              <strong>{editing.item.name}</strong>
              <span>Tồn kho hiện tại</span>
              <strong>{editing.item.quantity}</strong>
            </div>
            <div className="form-grid single">
              <label>
                {editing.mode === "add" ? "Số lượng nhập thêm" : "Số lượng thực tế sau kiểm kê"}
                <input type="number" min="0" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
            </div>
            {editing.mode === "add" && amount !== "" && (
              <p className="hint">Sau khi nhập: {editing.item.quantity + (Number(amount) || 0)}</p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default InventoryPage;
