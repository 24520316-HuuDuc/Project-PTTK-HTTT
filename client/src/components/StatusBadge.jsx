// Nhãn trạng thái có màu (đơn hàng, sản phẩm, tài khoản, thanh toán)
function StatusBadge({ status, label, kind = "order" }) {
  return <span className={`status-badge ${kind}-${status}`}>{label || status}</span>;
}

export default StatusBadge;
