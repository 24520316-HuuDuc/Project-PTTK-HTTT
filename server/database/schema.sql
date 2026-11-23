-- =====================================================================
-- HDX Tech - Lược đồ CSDL quan hệ (MySQL 8 / MariaDB 10.4+)
-- Theo tài liệu thống nhất của nhóm (mục 8): 8 bảng chính + Order_Status_History
-- Sửa bảng/cột: báo TV4 để cập nhật Class Diagram + ERD cùng lúc.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Order_Status_History;
DROP TABLE IF EXISTS Order_Items;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Cart_Items;
DROP TABLE IF EXISTS Carts;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users: tài khoản và thông tin người dùng (TV1)
--    role: customer = Khách hàng, employee = Nhân viên, manager = Người quản lý
CREATE TABLE Users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  phone          VARCHAR(15),
  address        VARCHAR(255),
  role           ENUM('customer', 'employee', 'manager') NOT NULL DEFAULT 'customer',
  status         ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories: danh mục sản phẩm (TV2)
--    status: active = đang sử dụng, inactive = ngừng sử dụng (ẩn khỏi cửa hàng)
CREATE TABLE Categories (
  category_id    INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL UNIQUE,
  description    VARCHAR(500),
  status         ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products: thông tin sản phẩm (TV2)
--    Không xóa vật lý sản phẩm đã có trong đơn hàng -> status = 'discontinued' (ngừng kinh doanh)
CREATE TABLE Products (
  product_id      INT AUTO_INCREMENT PRIMARY KEY,
  sku             VARCHAR(50) NOT NULL UNIQUE,
  category_id     INT NOT NULL,
  name            VARCHAR(200) NOT NULL,
  brand           VARCHAR(100),
  description     TEXT,
  specs           TEXT,                      -- thông số kỹ thuật dạng JSON {"CPU": "..."}
  warranty_months INT NOT NULL DEFAULT 12 CHECK (warranty_months >= 0),
  price           DECIMAL(12, 0) NOT NULL CHECK (price >= 0),
  image_url       VARCHAR(500),
  status          ENUM('active', 'discontinued') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- 4. Inventory: theo dõi số lượng tồn kho, mỗi sản phẩm 1 dòng (TV2)
CREATE TABLE Inventory (
  inventory_id   INT AUTO_INCREMENT PRIMARY KEY,
  product_id     INT NOT NULL UNIQUE,
  quantity       INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_by     INT NULL,                   -- nhân viên cập nhật kho gần nhất
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_user FOREIGN KEY (updated_by) REFERENCES Users(user_id)
);

-- 5. Carts: giỏ hàng, mỗi khách hàng 1 giỏ (TV3)
CREATE TABLE Carts (
  cart_id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 6. Cart_Items: sản phẩm trong giỏ hàng (TV3)
CREATE TABLE Cart_Items (
  cart_id        INT NOT NULL,
  product_id     INT NOT NULL,
  quantity       INT NOT NULL CHECK (quantity > 0),
  added_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id, product_id),
  CONSTRAINT fk_cartitems_cart FOREIGN KEY (cart_id) REFERENCES Carts(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_cartitems_product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- 7. Orders: đơn hàng (TV3 tạo, TV4 xử lý). Thanh toán chỉ COD.
--    status: pending Chờ xác nhận · confirmed Đã xác nhận · shipping Đang giao · delivered Đã giao
--            cancelled Đã hủy (khách hủy) · rejected Bị từ chối (nhân viên từ chối)
CREATE TABLE Orders (
  order_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  receiver_name    VARCHAR(100) NOT NULL,
  receiver_phone   VARCHAR(15) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  note             VARCHAR(500),
  total_amount     DECIMAL(12, 0) NOT NULL CHECK (total_amount >= 0),
  status           ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
  payment_method   ENUM('COD') NOT NULL DEFAULT 'COD',
  payment_status   ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
  paid_at          DATETIME NULL,            -- thời điểm khách thanh toán khi nhận hàng
  handled_by       INT NULL,                 -- nhân viên xử lý gần nhất
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES Users(user_id),
  CONSTRAINT fk_orders_employee FOREIGN KEY (handled_by) REFERENCES Users(user_id)
);

-- 8. Order_Items: chi tiết đơn hàng, lưu đơn giá tại thời điểm mua (TV3)
--    Sản phẩm ngừng kinh doanh không bị xóa nên dữ liệu đơn hàng vẫn giữ nguyên.
CREATE TABLE Order_Items (
  order_id       INT NOT NULL,
  product_id     INT NOT NULL,
  quantity       INT NOT NULL CHECK (quantity > 0),
  unit_price     DECIMAL(12, 0) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT fk_orderitems_order FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_orderitems_product FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- 9. Order_Status_History: lịch sử thay đổi trạng thái đơn hàng (TV4)
CREATE TABLE Order_Status_History (
  history_id     INT AUTO_INCREMENT PRIMARY KEY,
  order_id       INT NOT NULL,
  from_status    VARCHAR(20) NULL,           -- NULL = lúc tạo đơn
  to_status      VARCHAR(20) NOT NULL,
  note           VARCHAR(500),               -- ví dụ: lý do từ chối
  changed_by     INT NOT NULL,
  changed_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES Users(user_id)
);

CREATE INDEX idx_products_name ON Products(name);
CREATE INDEX idx_orders_status_date ON Orders(status, created_at);
CREATE INDEX idx_history_order ON Order_Status_History(order_id, changed_at);
