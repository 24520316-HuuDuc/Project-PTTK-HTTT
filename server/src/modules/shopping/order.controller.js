// =====================================================================
// Control: Đặt hàng, lịch sử đơn, hủy đơn — TV3 PHỤ TRÁCH
// UC10 Đặt hàng (COD), UC11 Xem lịch sử & trạng thái đơn, UC12 Hủy đơn khi Chờ xác nhận
// =====================================================================
const Order = require('./order.model');
const { HttpError, str, PHONE_REGEX } = require('../../utils/http');
const { PAYMENT_METHODS } = require('../../constants');

/** POST /api/orders — tạo đơn từ giỏ hàng (phải đăng nhập) */
exports.create = async (req, res) => {
  const shipping = {
    receiverName: str(req.body.receiverName),
    receiverPhone: str(req.body.receiverPhone),
    shippingAddress: str(req.body.shippingAddress),
    note: str(req.body.note),
  };
  const paymentMethod = req.body.paymentMethod || 'COD';

  if (!shipping.receiverName) throw new HttpError(400, 'Vui lòng nhập họ tên người nhận.');
  if (!PHONE_REGEX.test(shipping.receiverPhone)) throw new HttpError(400, 'Số điện thoại chưa hợp lệ.');
  if (!shipping.shippingAddress) throw new HttpError(400, 'Vui lòng nhập địa chỉ nhận hàng.');
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Cửa hàng chỉ hỗ trợ thanh toán khi nhận hàng (COD).');

  const { orderId, total } = await Order.createFromCart(req.user.user_id, shipping);
  res.status(201).json({ message: 'Đặt hàng thành công.', order_id: orderId, total_amount: total });
};

/** GET /api/orders — đơn của tôi (kèm sản phẩm và lịch sử trạng thái) */
exports.listMine = async (req, res) => {
  res.json({ orders: await Order.findByUser(req.user.user_id) });
};

/** POST /api/orders/:id/cancel  { reason? } */
exports.cancelMine = async (req, res) => {
  await Order.cancelByCustomer(req.params.id, req.user.user_id, str(req.body?.reason));
  res.json({ message: 'Đã hủy đơn hàng.' });
};
