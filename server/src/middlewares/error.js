// Xử lý 404 và lỗi chung — PHẦN CHUNG

function notFound(req, res) {
  res.status(404).json({ message: `Không tìm thấy API ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Dữ liệu bị trùng (email, mã SKU hoặc tên đã tồn tại).' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Dữ liệu gửi lên không đúng định dạng JSON.' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  return res.status(status).json({
    message: status === 500 ? 'Lỗi hệ thống, vui lòng thử lại.' : err.message,
  });
}

module.exports = { notFound, errorHandler };
