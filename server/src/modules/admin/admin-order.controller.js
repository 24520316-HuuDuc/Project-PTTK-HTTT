// =====================================================================
// Control: Xử lý đơn hàng — TV4 PHỤ TRÁCH
// UC13 Xem, xác nhận, từ chối, cập nhật trạng thái đơn hàng; UC14 TÌM KIẾM đơn hàng
// =====================================================================
const AdminOrder = require('./admin-order.model');
const { HttpError, str, isDate } = require('../../utils/http');
const { ORDER_STATUS } = require('../../constants');

const STATUSES = Object.values(ORDER_STATUS);

/** GET /api/admin/orders?q=&status=&from=&to= */
exports.list = async (req, res) => {
  const orders = await AdminOrder.search({
    keyword: str(req.query.q),
    status: STATUSES.includes(req.query.status) ? req.query.status : '',
    fromDate: isDate(req.query.from) ? req.query.from : '',
    toDate: isDate(req.query.to) ? req.query.to : '',
  });
  res.json({ orders });
};

/** GET /api/admin/orders/:id — kèm lịch sử trạng thái */
exports.detail = async (req, res) => {
  const order = await AdminOrder.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng.');
  res.json({ order });
};

/** PATCH /api/admin/orders/:id/status  { status, note }  (note bắt buộc khi từ chối) */
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  await AdminOrder.updateStatus(Number(req.params.id), status, req.user.user_id, str(req.body.note));
  res.json({ message: 'Đã cập nhật trạng thái đơn hàng.', order: await AdminOrder.findById(req.params.id) });
};
