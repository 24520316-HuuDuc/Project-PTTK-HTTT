// Quản lý danh mục: thêm, sửa, xóa hoặc ngừng sử dụng — TV2 PHỤ TRÁCH (UC08)
// Quy tắc: danh mục đã có sản phẩm thì không xóa được, chỉ "Ngừng sử dụng" (ẩn khỏi cửa hàng).
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Ban, RotateCcw } from "lucide-react";
import {
  adminGetCategories,
  createCategory,
  updateCategory,
  setCategoryStatus,
  deleteCategory,
} from "../../api/products";
import { CATEGORY_STATUS_LABELS } from "../../lib/constants";
import { toast } from "../../lib/toast";
import StatusBadge from "../../components/StatusBadge";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    adminGetCategories()
      .then((d) => setCategories(d.categories))
      .catch((err) => toast(err.message, "error"));
  }, []);

  /** Gọi API, hiện thông báo, cập nhật lại danh sách từ kết quả trả về. */
  const run = async (promise, after) => {
    try {
      const data = await promise;
      setCategories(data.categories);
      toast(data.message);
      after?.();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return toast("Vui lòng nhập tên danh mục.", "error");
    run(createCategory(newCat), () => setNewCat({ name: "", description: "" }));
  };

  const startEdit = (c) => {
    setEditingId(c.category_id);
    setEditForm({ name: c.name, description: c.description || "" });
  };

  const toggleStatus = (c) => {
    const next = c.status === "active" ? "inactive" : "active";
    const ask = next === "inactive" ? `Ngừng sử dụng danh mục "${c.name}"? Sản phẩm trong danh mục sẽ bị ẩn khỏi cửa hàng.` : `Sử dụng lại danh mục "${c.name}"?`;
    if (window.confirm(ask)) run(setCategoryStatus(c.category_id, next));
  };

  return (
    <div className="admin-grid-2 grid-1-2">
      <form className="admin-card" onSubmit={handleCreate}>
        <div className="admin-card-head">
          <h2>Thêm danh mục</h2>
        </div>
        <div className="form-grid single">
          <label>
            Tên danh mục *
            <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
          </label>
          <label>
            Mô tả
            <textarea rows={3} value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
          </label>
        </div>
        <button className="btn-primary" type="submit">
          <Plus size={16} /> Thêm
        </button>
        <p className="hint">Danh mục chưa có sản phẩm thì xóa được. Đã có sản phẩm thì chỉ ngừng sử dụng.</p>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Danh mục</h2>
          <span>{categories.length} danh mục</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Mô tả</th>
              <th className="num">SP đang bán</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.category_id ? (
                <tr key={c.category_id}>
                  <td>
                    <input className="cell-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </td>
                  <td className="num">{c.product_count}</td>
                  <td>
                    <StatusBadge kind="category" status={c.status} label={CATEGORY_STATUS_LABELS[c.status]} />
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-icon"
                      title="Lưu"
                      onClick={() => run(updateCategory(c.category_id, editForm), () => setEditingId(null))}
                    >
                      <Check size={15} />
                    </button>
                    <button type="button" className="btn-icon" title="Hủy" onClick={() => setEditingId(null)}>
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={c.category_id} className={c.status === "inactive" ? "row-muted" : ""}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.description}</td>
                  <td className="num">{c.product_count}</td>
                  <td>
                    <StatusBadge kind="category" status={c.status} label={CATEGORY_STATUS_LABELS[c.status]} />
                  </td>
                  <td className="actions">
                    <button type="button" className="btn-icon" title="Sửa" onClick={() => startEdit(c)}>
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className={`btn-icon ${c.status === "active" ? "danger" : ""}`}
                      title={c.status === "active" ? "Ngừng sử dụng" : "Sử dụng lại"}
                      onClick={() => toggleStatus(c)}
                    >
                      {c.status === "active" ? <Ban size={15} /> : <RotateCcw size={15} />}
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      title="Xóa (chỉ khi chưa có sản phẩm)"
                      onClick={() => window.confirm(`Xóa danh mục "${c.name}"?`) && run(deleteCategory(c.category_id))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCategoriesPage;
