// =====================================================================
// Control: Sản phẩm — TV2 PHỤ TRÁCH
// UC05 Xem sản phẩm, UC06 TÌM KIẾM sản phẩm, UC07 QUẢN LÝ sản phẩm (thêm, sửa, ngừng kinh doanh)
// =====================================================================
const Product = require('./product.model');
const Category = require('./category.model');
const { HttpError, str, nonNegativeInt } = require('../../utils/http');
const { PRODUCT_STATUSES } = require('../../constants');

const optionalNumber = (v) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

/** GET /api/products?q=&category=&min=&max=&sort= — phía khách (khách vãng lai cũng xem được) */
exports.search = async (req, res) => {
  const products = await Product.search({
    keyword: str(req.query.q),
    categoryId: optionalNumber(req.query.category),
    minPrice: optionalNumber(req.query.min),
    maxPrice: optionalNumber(req.query.max),
    sort: req.query.sort,
    forShop: true,
  });
  res.json({ products });
};

/** GET /api/products/:id */
exports.detail = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!Product.isSellable(product)) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
  res.json({ product });
};

/** GET /api/admin/products?q=&category=&status= — Nhân viên, Quản lý (gồm cả SP ngừng kinh doanh) */
exports.adminList = async (req, res) => {
  const products = await Product.search({
    keyword: str(req.query.q),
    categoryId: optionalNumber(req.query.category),
    status: PRODUCT_STATUSES.includes(req.query.status) ? req.query.status : '',
  });
  res.json({ products });
};

/** Kiểm tra + chuẩn hóa dữ liệu form sản phẩm. */
async function readProductForm(body) {
  const d = {
    sku: str(body.sku).toUpperCase(),
    name: str(body.name),
    brand: str(body.brand) || null,
    categoryId: Number(body.categoryId),
    description: str(body.description) || null,
    price: nonNegativeInt(body.price),
    warrantyMonths: nonNegativeInt(body.warrantyMonths ?? 12),
    imageUrl: str(body.imageUrl) || null,
    status: PRODUCT_STATUSES.includes(body.status) ? body.status : 'active',
    specs: null,
  };
  if (!d.sku) throw new HttpError(400, 'Vui lòng nhập mã SKU.');
  if (!d.name) throw new HttpError(400, 'Vui lòng nhập tên sản phẩm.');
  if (d.price === null) throw new HttpError(400, 'Giá bán phải là số nguyên không âm.');
  if (d.warrantyMonths === null) throw new HttpError(400, 'Số tháng bảo hành không hợp lệ.');
  if (!(await Category.findById(d.categoryId))) throw new HttpError(400, 'Danh mục không tồn tại.');

  // Thông số: nhận object {"CPU": "..."} hoặc chuỗi JSON
  if (body.specs && typeof body.specs === 'object') d.specs = JSON.stringify(body.specs);
  else if (str(body.specs)) {
    try {
      d.specs = JSON.stringify(JSON.parse(body.specs));
    } catch {
      throw new HttpError(400, 'Thông số kỹ thuật phải đúng dạng JSON, ví dụ {"CPU": "Core i5"}.');
    }
  }
  return d;
}

/** POST /api/admin/products  (kèm initialStock = tồn kho ban đầu) */
exports.create = async (req, res) => {
  const data = await readProductForm(req.body);
  const initialStock = nonNegativeInt(req.body.initialStock ?? 0);
  if (initialStock === null) throw new HttpError(400, 'Tồn kho ban đầu phải là số nguyên không âm.');
  const id = await Product.create(data, initialStock, req.user.user_id);
  res.status(201).json({ message: 'Đã thêm sản phẩm.', product: await Product.findById(id) });
};

/** PUT /api/admin/products/:id */
exports.update = async (req, res) => {
  if (!(await Product.findById(req.params.id))) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
  const data = await readProductForm(req.body);
  await Product.update(req.params.id, data);
  res.json({ message: 'Đã cập nhật sản phẩm.', product: await Product.findById(req.params.id) });
};

/**
 * PATCH /api/admin/products/:id/status  { status: 'discontinued' | 'active' }
 * Quy tắc: không xóa vật lý sản phẩm -> chuyển sang ngừng kinh doanh.
 */
exports.setStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
  const { status } = req.body;
  if (!PRODUCT_STATUSES.includes(status)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  await Product.setStatus(product.product_id, status);
  res.json({
    message: status === 'discontinued' ? `Đã ngừng kinh doanh "${product.name}".` : `Đã kinh doanh lại "${product.name}".`,
  });
};
