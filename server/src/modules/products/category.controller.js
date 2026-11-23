// =====================================================================
// Control: Danh mục — TV2 PHỤ TRÁCH
// UC08 QUẢN LÝ danh mục: thêm, sửa, xóa (khi chưa có sản phẩm) hoặc ngừng sử dụng
// =====================================================================
const Category = require('./category.model');
const { HttpError, str } = require('../../utils/http');
const { CATEGORY_STATUSES } = require('../../constants');

async function findOrFail(id) {
  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, 'Không tìm thấy danh mục.');
  return category;
}

/** GET /api/categories — phía khách: chỉ danh mục đang sử dụng */
exports.list = async (req, res) => {
  res.json({ categories: await Category.findAll({ onlyActive: true }) });
};

/** GET /api/admin/categories — tất cả danh mục */
exports.adminList = async (req, res) => {
  res.json({ categories: await Category.findAll() });
};

/** POST /api/admin/categories */
exports.create = async (req, res) => {
  const name = str(req.body.name);
  if (!name) throw new HttpError(400, 'Vui lòng nhập tên danh mục.');
  await Category.create({ name, description: str(req.body.description) });
  res.status(201).json({ message: 'Đã thêm danh mục.', categories: await Category.findAll() });
};

/** PUT /api/admin/categories/:id */
exports.update = async (req, res) => {
  const name = str(req.body.name);
  if (!name) throw new HttpError(400, 'Vui lòng nhập tên danh mục.');
  await findOrFail(req.params.id);
  await Category.update(req.params.id, { name, description: str(req.body.description) });
  res.json({ message: 'Đã cập nhật danh mục.', categories: await Category.findAll() });
};

/** PATCH /api/admin/categories/:id/status  { status: 'active' | 'inactive' } */
exports.setStatus = async (req, res) => {
  const category = await findOrFail(req.params.id);
  const { status } = req.body;
  if (!CATEGORY_STATUSES.includes(status)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  await Category.setStatus(category.category_id, status);
  res.json({
    message: status === 'inactive' ? `Đã ngừng sử dụng danh mục "${category.name}".` : `Đã sử dụng lại danh mục "${category.name}".`,
    categories: await Category.findAll(),
  });
};

/** DELETE /api/admin/categories/:id — chỉ xóa được danh mục chưa có sản phẩm nào */
exports.remove = async (req, res) => {
  const category = await findOrFail(req.params.id);
  if ((await Category.countProducts(category.category_id)) > 0) {
    throw new HttpError(400, 'Danh mục đã có sản phẩm nên không thể xóa. Hãy chọn "Ngừng sử dụng".');
  }
  await Category.remove(category.category_id);
  res.json({ message: 'Đã xóa danh mục.', categories: await Category.findAll() });
};
