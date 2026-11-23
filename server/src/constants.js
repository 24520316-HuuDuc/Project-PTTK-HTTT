// HẰNG SỐ DÙNG CHUNG — phải khớp CSDL (schema.sql), State Diagram, báo cáo và client/src/lib/constants.js
// Đây là bộ quy tắc nghiệp vụ nhóm đã thống nhất (tài liệu mục 6). Đổi gì phải báo cả nhóm.

const ROLES = {
  CUSTOMER: 'customer', // Khách hàng
  EMPLOYEE: 'employee', // Nhân viên
  MANAGER: 'manager', // Người quản lý (có toàn bộ quyền của Nhân viên + tài khoản + thống kê)
};

// Nhân viên và quản lý đều làm được các chức năng bán hàng
const STAFF_ROLES = [ROLES.EMPLOYEE, ROLES.MANAGER];

const USER_STATUSES = ['active', 'locked'];
const PRODUCT_STATUSES = ['active', 'discontinued']; // đang kinh doanh / ngừng kinh doanh
const CATEGORY_STATUSES = ['active', 'inactive']; // đang sử dụng / ngừng sử dụng

const ORDER_STATUS = {
  PENDING: 'pending', // Chờ xác nhận
  CONFIRMED: 'confirmed', // Đã xác nhận
  SHIPPING: 'shipping', // Đang giao
  DELIVERED: 'delivered', // Đã giao
  CANCELLED: 'cancelled', // Đã hủy (do KHÁCH hủy)
  REJECTED: 'rejected', // Bị từ chối (do NHÂN VIÊN từ chối)
};

// State Diagram đơn hàng — ai được chuyển từ trạng thái nào sang trạng thái nào
const CUSTOMER_TRANSITIONS = {
  pending: ['cancelled'], // khách chỉ hủy được khi Chờ xác nhận
};
const STAFF_TRANSITIONS = {
  pending: ['confirmed', 'rejected'], // xác nhận hoặc từ chối
  confirmed: ['shipping'],
  shipping: ['delivered'],
};

// Hủy hoặc từ chối -> hoàn lại tồn kho đã trừ
const RESTOCK_STATUSES = ['cancelled', 'rejected'];

// Thanh toán: chỉ COD (không tích hợp ngân hàng, ví điện tử)
const PAYMENT_METHODS = ['COD'];

module.exports = {
  ROLES,
  STAFF_ROLES,
  USER_STATUSES,
  PRODUCT_STATUSES,
  CATEGORY_STATUSES,
  ORDER_STATUS,
  CUSTOMER_TRANSITIONS,
  STAFF_TRANSITIONS,
  RESTOCK_STATUSES,
  PAYMENT_METHODS,
};
