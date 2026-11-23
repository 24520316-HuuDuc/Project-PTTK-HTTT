// =====================================================================
// Control: Quản lý kho — TV2 PHỤ TRÁCH
// Nhân viên kiểm tra và cập nhật số lượng tồn kho
// =====================================================================
const Inventory = require('./inventory.model');
const Product = require('./product.model');
const { HttpError, str, nonNegativeInt } = require('../../utils/http');

/** GET /api/admin/inventory?q=&category=&low=5 */
exports.list = async (req, res) => {
  const low = req.query.low === undefined || req.query.low === '' ? null : nonNegativeInt(req.query.low);
  const items = await Inventory.list({
    keyword: str(req.query.q),
    categoryId: Number(req.query.category) || null,
    lowStock: low,
  });
  res.json({ items });
};

/**
 * PATCH /api/admin/inventory/:productId
 *   { mode: 'add', quantity: 10 }  -> nhập thêm 10
 *   { mode: 'set', quantity: 25 }  -> kiểm kê, đặt lại còn 25
 */
exports.update = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
  const amount = nonNegativeInt(req.body.quantity);
  if (amount === null) throw new HttpError(400, 'Số lượng phải là số nguyên không âm.');

  const current = (await Inventory.getQuantity(product.product_id)) ?? 0;
  const next = req.body.mode === 'add' ? current + amount : amount;
  if (req.body.mode === 'add' && amount === 0) throw new HttpError(400, 'Số lượng nhập thêm phải lớn hơn 0.');

  await Inventory.setQuantity(product.product_id, next, req.user.user_id);
  res.json({ message: `Đã cập nhật tồn kho "${product.name}": ${current} → ${next}.`, quantity: next });
};
