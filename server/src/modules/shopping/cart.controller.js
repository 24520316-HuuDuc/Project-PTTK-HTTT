// =====================================================================
// Control: Giỏ hàng — TV3 PHỤ TRÁCH
// UC09 Quản lý giỏ hàng: thêm, sửa số lượng, xóa sản phẩm, tính tổng tiền
// =====================================================================
const Cart = require('./cart.model');
const Product = require('../products/product.model');
const { HttpError, nonNegativeInt } = require('../../utils/http');

/** Trả về giỏ đầy đủ: items, tổng số lượng, tổng tiền. */
async function sendCart(res, userId, message) {
  const items = await Cart.getItems(userId);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ message, items, count, total });
}

async function getSellableProduct(productId) {
  const product = await Product.findById(productId);
  if (!Product.isSellable(product)) throw new HttpError(404, 'Sản phẩm đã ngừng kinh doanh.');
  return product;
}

/** GET /api/cart */
exports.get = async (req, res) => sendCart(res, req.user.user_id);

/** POST /api/cart/items  { productId, quantity } — cộng dồn nếu đã có */
exports.add = async (req, res) => {
  const userId = req.user.user_id;
  const quantity = nonNegativeInt(req.body.quantity ?? 1) || 1;
  const product = await getSellableProduct(req.body.productId);
  const newQuantity = (await Cart.getQuantity(userId, product.product_id)) + quantity;
  if (newQuantity > product.stock) {
    throw new HttpError(400, product.stock === 0 ? 'Sản phẩm đã hết hàng.' : `Chỉ còn ${product.stock} sản phẩm trong kho.`);
  }
  await Cart.setQuantity(userId, product.product_id, newQuantity);
  return sendCart(res, userId, 'Đã thêm vào giỏ hàng.');
};

/** PUT /api/cart/items/:productId  { quantity } — 0 = xóa */
exports.update = async (req, res) => {
  const userId = req.user.user_id;
  const quantity = nonNegativeInt(req.body.quantity);
  if (quantity === null) throw new HttpError(400, 'Số lượng không hợp lệ.');
  if (quantity > 0) {
    const product = await getSellableProduct(req.params.productId);
    if (quantity > product.stock) throw new HttpError(400, `Chỉ còn ${product.stock} sản phẩm trong kho.`);
  }
  await Cart.setQuantity(userId, Number(req.params.productId), quantity);
  return sendCart(res, userId);
};

/** DELETE /api/cart/items/:productId */
exports.remove = async (req, res) => {
  await Cart.removeItem(req.user.user_id, Number(req.params.productId));
  return sendCart(res, req.user.user_id, 'Đã xóa khỏi giỏ hàng.');
};
