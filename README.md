# HDX Tech — Hệ thống quản lý bán hàng trực tuyến

Đồ án môn **Phân tích thiết kế hệ thống thông tin (MSIS5723)** — UIT.
Website bán hàng trực tuyến cho **một cửa hàng duy nhất** (HDX Tech, đồ công nghệ): khách xem, tìm kiếm, đặt hàng COD; nhân viên quản lý sản phẩm, danh mục, kho, xử lý đơn; người quản lý quản lý tài khoản và xem thống kê.

| Phần | Công nghệ |
| --- | --- |
| Giao diện (`client/`) | React 19 + Vite + React Router |
| API (`server/`) | Node.js + Express, đăng nhập bằng JWT |
| CSDL | MySQL 8 (MySQL Workbench hoặc XAMPP), 9 bảng |

---

## 1. Cài đặt và chạy

Cần cài: [Node.js 20+](https://nodejs.org), MySQL 8 (MySQL Server + Workbench, hoặc XAMPP), VS Code.

```bash
npm run setup                 # cài thư viện cho server và client

cd server
cp .env.example .env          # Windows: copy .env.example .env
#   mở server/.env, điền DB_PASSWORD = mật khẩu root MySQL của bạn
cd ..

npm run db:init               # tạo database hdx_tech + 9 bảng + dữ liệu mẫu (xóa dữ liệu cũ)

npm run dev:server            # terminal 1 — API:       http://localhost:3001/api
npm run dev:client            # terminal 2 — Giao diện: http://localhost:5173
```

Demo bằng 1 lệnh: `npm run build` rồi `npm start` → http://localhost:3001

### Tài khoản mẫu (mật khẩu `123456`, trang đăng nhập có nút điền nhanh)

| Actor | Email |
| --- | --- |
| Người quản lý (Manager) | admin@hdxtech.vn |
| Nhân viên (Employee) | nhanvien@hdxtech.vn |
| Khách hàng (Customer) | an@gmail.com · binh@gmail.com · cuong@gmail.com |
| Khách vãng lai (Guest) | không đăng nhập |

---

## 2. Đối chiếu với tài liệu thống nhất của nhóm

### 2.1. Actors và quyền

| Actor | Làm được gì trong web |
| --- | --- |
| **Guest** | Xem danh sách, tìm kiếm, lọc, xem chi tiết sản phẩm. Bấm mua sẽ bị chuyển sang đăng nhập. |
| **Customer** | Đăng ký, đăng nhập, đăng xuất · tìm kiếm, lọc · thêm, sửa số lượng, xóa sản phẩm trong giỏ · đặt hàng COD · xem lịch sử và trạng thái đơn (kèm lý do từ chối) · hủy đơn khi còn Chờ xác nhận |
| **Employee** | Thêm, sửa, xem, ngừng kinh doanh sản phẩm · thêm, sửa, xóa, ngừng sử dụng danh mục · kiểm tra, nhập thêm, kiểm kê tồn kho · xem, tìm kiếm, xác nhận, từ chối, cập nhật trạng thái đơn |
| **Manager** | Toàn bộ quyền của Employee + Dashboard · quản lý tài khoản nhân viên và khách hàng (tạo, sửa, đổi vai trò, khóa, đặt lại mật khẩu) · thống kê doanh thu, số lượng đơn, sản phẩm bán chạy |

### 2.2. Quy tắc nghiệp vụ (mục 6 tài liệu) — đã cài đặt

| Quy tắc | Cài ở đâu |
| --- | --- |
| Phải đăng nhập mới đặt hàng | `shopping.routes.js` (chỉ role customer) |
| Khách chỉ hủy khi Chờ xác nhận | `Order.cancelByCustomer()` |
| 6 trạng thái: Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, Đã hủy, Bị từ chối | `constants.js` (server + client), cột `Orders.status` |
| Đã hủy (khách) ≠ Bị từ chối (nhân viên, bắt buộc nhập lý do) | `CUSTOMER_TRANSITIONS` / `STAFF_TRANSITIONS`, lý do lưu ở `Order_Status_History.note` |
| Trừ tồn kho khi đặt hàng thành công | `Order.createFromCart()` (transaction, khóa dòng) |
| Hủy hoặc từ chối → hoàn lại tồn kho | `Order.restock()` |
| Không xóa vật lý sản phẩm, chỉ ngừng kinh doanh | không có API xóa sản phẩm; `PATCH /admin/products/:id/status` |
| Danh mục: xóa khi chưa có SP, có SP thì ngừng sử dụng | `category.controller.remove()` / `setStatus()` |
| Manager có toàn bộ quyền của Employee + tài khoản, thống kê | `STAFF_ROLES`, `requireRole()` |
| Doanh thu chỉ tính đơn đã giao | `stats.model.js` (`status = 'delivered'`) |
| Thanh toán chỉ COD; giao thành công → Đã thanh toán | `Orders.payment_method/payment_status`, `AdminOrder.updateStatus()` |

### 2.3. State Diagram đơn hàng

```
[Khách đặt hàng] → Chờ xác nhận ──(NV xác nhận)──→ Đã xác nhận ──(NV giao hàng)──→ Đang giao ──(giao thành công)──→ Đã giao
                       │                                                                                       (đã thanh toán COD)
                       ├──(Khách hủy)──→ Đã hủy        [hoàn kho]
                       └──(NV từ chối + lý do)──→ Bị từ chối   [hoàn kho]
```

### 2.4. CSDL — 9 bảng (`server/database/schema.sql`)

| Bảng | Chức năng | Ghi chú so với tài liệu |
| --- | --- | --- |
| Users | Tài khoản, vai trò, trạng thái | |
| Categories | Danh mục, có `status` đang/ngừng sử dụng | |
| Products | Sản phẩm, `status` đang/ngừng kinh doanh | không còn cột tồn kho |
| Inventory | Tồn kho mỗi sản phẩm, ai cập nhật | |
| Carts | Giỏ hàng, mỗi khách 1 giỏ | |
| Cart_Items | Sản phẩm trong giỏ | |
| Orders | Đơn hàng + thông tin thanh toán COD | thay cho bảng Payments trong ý tưởng ban đầu |
| Order_Items | Chi tiết đơn, giữ đơn giá lúc mua | |
| Order_Status_History | Lịch sử đổi trạng thái, người đổi, lý do | bảng bổ sung tài liệu gợi ý |

### 2.5. Yêu cầu chương trình của đề cương (A3)

| Yêu cầu | Chức năng | TV |
| --- | --- | --- |
| ≥ 2 quản lý | Sản phẩm · Danh mục · Kho · Đơn hàng · Tài khoản | 2, 2, 2, 4, 1 |
| ≥ 2 tìm kiếm | Sản phẩm (tên/SKU/thương hiệu, danh mục, giá) · Đơn hàng (mã, khách, SĐT, trạng thái, ngày) · Tài khoản (tên, email, SĐT, vai trò) | 2, 4, 1 |
| ≥ 2 thống kê | Doanh thu theo ngày/tháng · Số lượng đơn theo trạng thái · Sản phẩm bán chạy | 4 |

---

## 3. Sơ đồ thư mục và người phụ trách

```
hdx-tech-shop/
├── server/
│   ├── database/  schema.sql (9 bảng) · seed.sql (dữ liệu mẫu) · init.js
│   └── src/
│       ├── constants.js            # vai trò, trạng thái, State Diagram (CHUNG)
│       ├── middlewares/auth.js     # JWT + phân quyền (TV1)
│       └── modules/
│           ├── accounts/   TV1: auth.controller, user-admin.controller, user.model
│           ├── products/   TV2: product / category / inventory (controller + model)
│           ├── shopping/   TV3: cart / order (controller + model)
│           └── admin/      TV4: admin-order / stats (controller + model)
├── client/src/
│   ├── api/        accounts (TV1) · products (TV2) · shopping (TV3) · admin (TV4)
│   ├── context/    AuthContext (TV1) · CartContext (TV3)
│   ├── layouts/    ShopLayout (TV2) · AdminLayout (TV4)
│   ├── components/ Header, ProductCard, ProductDetail (TV2) · CartDrawer, Checkout (TV3) · BarChart (TV4)
│   └── pages/
│       ├── accounts/  TV1: Login, Register, Profile, AdminAccounts
│       ├── products/  TV2: Home, AdminProducts, AdminCategories, Inventory
│       ├── shopping/  TV3: MyOrders
│       └── admin/     TV4: Dashboard, AdminOrders, Reports
└── docs/           sơ đồ UML, báo cáo, link video demo
```

Boundary = trang React · Control = `*.controller.js` · Entity = `*.model.js` + bảng MySQL.
3 sequence diagram trong tài liệu ứng với code:

| Sequence | Luồng trong code |
| --- | --- |
| Đăng nhập | `LoginPage` → `POST /api/auth/login` → `auth.controller.login()` → `User.findByEmail()` → bảng Users |
| Khách đặt hàng | `Checkout` → `POST /api/orders` → `order.controller.create()` → `Order.createFromCart()` → Cart_Items, Inventory, Orders, Order_Items, Order_Status_History |
| NV xác nhận/cập nhật đơn | `AdminOrdersPage` → `PATCH /api/admin/orders/:id/status` → `admin-order.controller.updateStatus()` → `AdminOrder.updateStatus()` → Orders, Inventory, Order_Status_History |

---

## 4. Danh sách API

| API | Quyền | TV |
| --- | --- | --- |
| POST `/api/auth/register` · `/auth/login` · GET `/auth/me` · PUT `/account/profile` · `/account/password` | Tất cả / đã đăng nhập | 1 |
| GET/POST `/api/admin/users` · GET/PUT `/:id` · PATCH `/:id/status` · POST `/:id/reset-password` | Manager | 1 |
| GET `/api/categories` · `/api/products?q=&category=&min=&max=&sort=` · `/api/products/:id` | Tất cả | 2 |
| GET/POST `/api/admin/products` · PUT `/:id` · PATCH `/:id/status` | Employee, Manager | 2 |
| GET/POST `/api/admin/categories` · PUT/DELETE `/:id` · PATCH `/:id/status` | Employee, Manager | 2 |
| GET `/api/admin/inventory` · PATCH `/api/admin/inventory/:productId` | Employee, Manager | 2 |
| GET `/api/cart` · POST `/cart/items` · PUT/DELETE `/cart/items/:productId` | Customer | 3 |
| POST/GET `/api/orders` · POST `/api/orders/:id/cancel` | Customer | 3 |
| GET `/api/admin/orders` · GET `/:id` · PATCH `/:id/status` | Employee, Manager | 4 |
| GET `/api/admin/stats/overview` · `revenue` · `order-status` · `top-products` | Manager | 4 |

---

## 5. Làm việc nhóm với Git

```bash
git checkout -b tv1-accounts        # tv2-products | tv3-shopping | tv4-admin
git add . && git commit -m "TV1: ..."
git push -u origin tv1-accounts     # tạo Pull Request vào main, TV4 kiểm tra rồi merge
```

Không commit: `server/.env`, `node_modules/`, `client/dist/`.
