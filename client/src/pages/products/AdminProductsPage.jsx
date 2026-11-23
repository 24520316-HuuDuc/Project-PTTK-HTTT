// Quản lý sản phẩm: thêm, sửa, xem, ngừng kinh doanh — TV2 PHỤ TRÁCH (UC07)
// Quy tắc: không xóa vật lý sản phẩm, chỉ chuyển sang Ngừng kinh doanh để giữ dữ liệu đơn hàng.
import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Pencil, Ban, RotateCcw, X } from "lucide-react";
import { Link } from "react-router-dom";
import { adminSearchProducts, adminGetCategories, createProduct, updateProduct, setProductStatus } from "../../api/products";
import { PRODUCT_STATUS_LABELS, LOW_STOCK } from "../../lib/constants";
import { formatMoney } from "../../lib/format";
import { getProductImage } from "../../lib/anh";
import { toast } from "../../lib/toast";
import StatusBadge from "../../components/StatusBadge";

const EMPTY_FORM = {
  sku: "",
  name: "",
  brand: "",
  categoryId: "",
  price: "",
  initialStock: 0, // chỉ dùng khi thêm mới; sau đó cập nhật ở trang Kho hàng
  warrantyMonths: 12,
  imageUrl: "",
  status: "active",
  description: "",
  specsText: "", // mỗi dòng "Tên: Giá trị"
};

/** {"CPU": "i5"} <-> "CPU: i5" (mỗi dòng 1 thông số) cho dễ nhập */
const specsToText = (specs) =>
  specs && typeof specs === "object" ? Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join("\n") : specs || "";
const textToSpecs = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  return Object.fromEntries(
    lines.map((line) => {
      const i = line.indexOf(":");
      return i === -1 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
  );
};

function AdminProductsPage() {
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = đóng form, {} = thêm mới, {product_id...} = sửa
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const data = await adminSearchProducts(f);
      setProducts(data.products);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({});
    adminGetCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditing({});
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.category_id || "" });
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      sku: p.sku,
      name: p.name,
      brand: p.brand || "",
      categoryId: p.category_id,
      price: p.price,
      warrantyMonths: p.warranty_months,
      imageUrl: p.image || "",
      status: p.status,
      description: p.description || "",
      specsText: specsToText(p.specs),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim()) return toast("Vui lòng nhập mã SKU và tên sản phẩm.", "error");
    const { specsText, ...rest } = form;
    const payload = { ...rest, specs: textToSpecs(specsText) };
    setSaving(true);
    try {
      const data = editing.product_id ? await updateProduct(editing.product_id, payload) : await createProduct(payload);
      toast(data.message);
      setEditing(null);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (p) => {
    const next = p.status === "active" ? "discontinued" : "active";
    const ask = next === "discontinued" ? `Ngừng kinh doanh "${p.name}"? Khách sẽ không thấy sản phẩm này nữa.` : `Kinh doanh lại "${p.name}"?`;
    if (!window.confirm(ask)) return;
    try {
      const data = await setProductStatus(p.product_id, next);
      toast(data.message);
      load(filters);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Tên, mã SKU, thương hiệu" />
        </div>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Mọi danh mục</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(PRODUCT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="btn-primary" type="submit">
          Tìm kiếm
        </button>
        <button className="btn-primary toolbar-right" type="button" onClick={openCreate}>
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </form>

      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Sản phẩm</h2>
          <span>{products.length} sản phẩm</span>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>SKU</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th className="num">Giá bán</th>
                <th className="num">Tồn kho</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty">Đang tải...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="empty">Không có sản phẩm phù hợp.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      <img className="table-thumb" src={getProductImage(p)} alt="" />
                    </td>
                    <td>{p.sku}</td>
                    <td>
                      {p.name}
                      <small className="muted-line">{p.brand}</small>
                    </td>
                    <td>{p.category}</td>
                    <td className="num">{formatMoney(p.price)}</td>
                    <td className={`num ${p.stock <= LOW_STOCK ? "text-warn" : ""}`}>{p.stock}</td>
                    <td>
                      <StatusBadge kind="product" status={p.status} label={PRODUCT_STATUS_LABELS[p.status]} />
                    </td>
                    <td className="actions">
                      <button type="button" className="btn-icon" onClick={() => openEdit(p)} title="Sửa">
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className={`btn-icon ${p.status === "active" ? "danger" : ""}`}
                        onClick={() => toggleStatus(p)}
                        title={p.status === "active" ? "Ngừng kinh doanh" : "Kinh doanh lại"}
                      >
                        {p.status === "active" ? <Ban size={15} /> : <RotateCcw size={15} />}
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
          <form className="modal modal-wide" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <div className="modal-head">
              <h2>{editing.product_id ? `Sửa: ${editing.name}` : "Thêm sản phẩm"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Mã SKU *
                <input value={form.sku} onChange={set("sku")} placeholder="VD: MS-LOGI-G102" />
              </label>
              <label>
                Thương hiệu
                <input value={form.brand} onChange={set("brand")} />
              </label>
              <label className="span-2">
                Tên sản phẩm *
                <input value={form.name} onChange={set("name")} />
              </label>
              <label>
                Danh mục *
                <select value={form.categoryId} onChange={set("categoryId")}>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trạng thái
                <select value={form.status} onChange={set("status")}>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Giá bán (đ) *
                <input type="number" min="0" value={form.price} onChange={set("price")} />
              </label>
              {editing.product_id ? (
                <label>
                  Tồn kho hiện tại
                  <div className="readonly-field">
                    {editing.stock} · <Link to="/admin/inventory">cập nhật ở Kho hàng</Link>
                  </div>
                </label>
              ) : (
                <label>
                  Tồn kho ban đầu
                  <input type="number" min="0" value={form.initialStock} onChange={set("initialStock")} />
                </label>
              )}
              <label>
                Bảo hành (tháng)
                <input type="number" min="0" value={form.warrantyMonths} onChange={set("warrantyMonths")} />
              </label>
              <label>
                Link ảnh (URL)
                <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://... (để trống = ảnh mặc định)" />
              </label>
              <label className="span-2">
                Mô tả
                <textarea rows={2} value={form.description} onChange={set("description")} />
              </label>
              <label className="span-2">
                Thông số kỹ thuật (mỗi dòng: Tên: Giá trị)
                <textarea rows={4} value={form.specsText} onChange={set("specsText")} placeholder={"CPU: Intel Core i5\nRAM: 16GB"} />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AdminProductsPage;
