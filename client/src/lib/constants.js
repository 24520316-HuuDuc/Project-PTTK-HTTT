// Nhãn hiển thị + quy tắc nghiệp vụ — phải khớp server/src/constants.js và CSDL

export const ROLE_LABELS = {
  customer: "Khách hàng",
  employee: "Nhân viên",
  manager: "Người quản lý",
};

export const USER_STATUS_LABELS = {
  active: "Hoạt động",
  locked: "Bị khóa",
};

export const PRODUCT_STATUS_LABELS = {
  active: "Đang kinh doanh",
  discontinued: "Ngừng kinh doanh",
};

export const CATEGORY_STATUS_LABELS = {
  active: "Đang sử dụng",
  inactive: "Ngừng sử dụng",
};

export const ORDER_STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  rejected: "Bị từ chối",
};

// State Diagram: nhân viên/quản lý được chuyển trạng thái nào (khách chỉ hủy khi Chờ xác nhận)
export const STAFF_TRANSITIONS = {
  pending: ["confirmed", "rejected"],
  confirmed: ["shipping"],
  shipping: ["delivered"],
};

// Nhãn nút bấm khi chuyển sang trạng thái tương ứng
export const ORDER_ACTION_LABELS = {
  confirmed: "Xác nhận đơn",
  rejected: "Từ chối đơn",
  shipping: "Bắt đầu giao hàng",
  delivered: "Đã giao thành công",
};

export const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng (COD)",
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

// Ngưỡng cảnh báo sắp hết hàng
export const LOW_STOCK = 5;
