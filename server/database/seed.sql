-- =====================================================================
-- Dữ liệu mẫu để demo — chạy SAU khi init.js đã tạo 5 tài khoản mẫu:
--   user_id 1 = Quản lý, 2 = Nhân viên, 3, 4, 5 = Khách hàng
-- =====================================================================

INSERT INTO Categories (category_id, name, description, status) VALUES
(1, 'Laptop',     'Máy tính xách tay học tập, văn phòng, gaming', 'active'),
(2, 'Bàn phím',   'Bàn phím cơ, bàn phím không dây', 'active'),
(3, 'Chuột',      'Chuột gaming, chuột văn phòng', 'active'),
(4, 'Tai nghe',   'Tai nghe chụp tai, tai nghe gaming', 'active'),
(5, 'Màn hình',   'Màn hình máy tính các kích thước', 'active'),
(6, 'Phụ kiện',   'Ổ cứng, hub, webcam, balo và phụ kiện khác', 'active'),
(7, 'Máy in',     'Danh mục đã ngừng sử dụng (ví dụ minh họa)', 'inactive');

INSERT INTO Products (product_id, sku, category_id, name, brand, price, warranty_months, status, specs, description) VALUES
(1, 'LT-ASUS-VB15', 1, 'Laptop ASUS Vivobook 15 X1504VA', 'ASUS', 14990000, 24, 'active', '{"CPU":"Intel Core i5-1335U","RAM":"16GB DDR4","Ổ cứng":"SSD 512GB","Màn hình":"15.6 inch Full HD"}', 'Laptop mỏng nhẹ cho sinh viên và dân văn phòng.'),
(2, 'LT-ACER-AS5', 1, 'Laptop Acer Aspire 5 A515', 'Acer', 13490000, 12, 'active', '{"CPU":"Intel Core i5-1235U","RAM":"8GB DDR4","Ổ cứng":"SSD 512GB","Màn hình":"15.6 inch Full HD"}', 'Hiệu năng ổn định, bàn phím có đèn nền.'),
(3, 'LT-LENOVO-IP3', 1, 'Laptop Lenovo IdeaPad Slim 3', 'Lenovo', 11990000, 24, 'active', '{"CPU":"AMD Ryzen 5 7520U","RAM":"8GB","Ổ cứng":"SSD 512GB","Màn hình":"14 inch Full HD"}', 'Thiết kế gọn, pin lâu.'),
(4, 'KB-KEYCHRON-K2', 2, 'Bàn phím cơ Keychron K2 Pro', 'Keychron', 2290000, 12, 'active', '{"Layout":"75%","Switch":"Gateron Brown","Kết nối":"Bluetooth 5.1 / USB-C"}', 'Bàn phím cơ không dây, tương thích Mac và Windows.'),
(5, 'KB-AKKO-3068', 2, 'Bàn phím cơ AKKO 3068B Plus', 'AKKO', 1590000, 12, 'active', '{"Layout":"65%","Switch":"AKKO CS Jelly Pink","Kết nối":"3 chế độ"}', 'Keycap PBT, hot-swap.'),
(6, 'MS-LOGI-G102', 3, 'Chuột gaming Logitech G102 Lightsync', 'Logitech', 399000, 24, 'active', '{"DPI":"8000","Kết nối":"USB có dây","Đèn":"RGB Lightsync"}', 'Chuột gaming bán chạy, nhẹ 85g.'),
(7, 'MS-LOGI-M650', 3, 'Chuột không dây Logitech M650', 'Logitech', 690000, 12, 'active', '{"Kết nối":"Bluetooth / Logi Bolt","Pin":"24 tháng","Click":"Yên tĩnh"}', 'Chuột văn phòng êm, pin lâu.'),
(8, 'MS-RAZER-DA', 3, 'Chuột Razer DeathAdder Essential', 'Razer', 490000, 24, 'active', '{"DPI":"6400","Kết nối":"USB có dây"}', 'Thiết kế công thái học cho tay phải.'),
(9, 'HP-SONY-WH1000', 4, 'Tai nghe Sony WH-1000XM5', 'Sony', 7490000, 12, 'active', '{"Chống ồn":"Chủ động ANC","Pin":"30 giờ","Kết nối":"Bluetooth 5.2"}', 'Tai nghe chống ồn hàng đầu.'),
(10, 'HP-JBL-T520', 4, 'Tai nghe JBL Tune 520BT', 'JBL', 1190000, 12, 'active', '{"Pin":"57 giờ","Kết nối":"Bluetooth 5.3"}', 'Âm bass JBL Pure Bass, gập gọn.'),
(11, 'HP-HYPERX-C2', 4, 'Tai nghe gaming HyperX Cloud II', 'HyperX', 1890000, 24, 'active', '{"Âm thanh":"7.1 giả lập","Micro":"Tháo rời","Kết nối":"USB / 3.5mm"}', 'Tai nghe gaming đeo êm.'),
(12, 'MN-LG-24MP', 5, 'Màn hình LG 24MP400 24 inch IPS', 'LG', 2690000, 24, 'active', '{"Kích thước":"23.8 inch","Tấm nền":"IPS","Tần số quét":"75Hz"}', 'Màn hình văn phòng viền mỏng.'),
(13, 'MN-AOC-24G2', 5, 'Màn hình gaming AOC 24G2SP 165Hz', 'AOC', 3990000, 36, 'active', '{"Kích thước":"23.8 inch","Tấm nền":"IPS","Tần số quét":"165Hz"}', 'Màn hình gaming tần số quét cao.'),
(14, 'AC-SAMSUNG-870', 6, 'Ổ cứng SSD Samsung 870 EVO 500GB', 'Samsung', 1450000, 60, 'active', '{"Dung lượng":"500GB","Chuẩn":"SATA III 2.5 inch","Tốc độ đọc":"560MB/s"}', 'SSD bền bỉ, bảo hành 5 năm.'),
(15, 'AC-UGREEN-HUB', 6, 'Hub USB-C Ugreen 6 in 1', 'Ugreen', 650000, 18, 'active', '{"Cổng":"HDMI 4K, 3x USB-A, SD, PD 100W"}', 'Mở rộng cổng cho laptop.'),
(16, 'AC-LOGI-C920', 6, 'Webcam Logitech C920 HD Pro', 'Logitech', 1690000, 24, 'active', '{"Độ phân giải":"Full HD 1080p","Micro":"Stereo"}', 'Webcam học online, họp trực tuyến.'),
(17, 'AC-BALO-HDX', 6, 'Balo laptop chống sốc 15.6 inch', 'HDX', 390000, 6, 'active', '{"Kích thước":"15.6 inch","Chất liệu":"Vải chống nước"}', 'Balo có ngăn chống sốc riêng cho laptop.'),
(18, 'MS-GENIUS-DX110', 3, 'Chuột có dây Genius DX-110', 'Genius', 99000, 6, 'discontinued', '{"DPI":"1000","Kết nối":"USB có dây"}', 'Mẫu cũ, đã ngừng kinh doanh (ví dụ minh họa).');

-- Tồn kho (Inventory): mỗi sản phẩm 1 dòng
INSERT INTO Inventory (product_id, quantity, updated_by) VALUES
(1, 12, 2),
(2, 8, 2),
(3, 0, 2),
(4, 20, 2),
(5, 25, 2),
(6, 60, 2),
(7, 35, 2),
(8, 30, 2),
(9, 10, 2),
(10, 40, 2),
(11, 18, 2),
(12, 15, 2),
(13, 9, 2),
(14, 30, 2),
(15, 45, 2),
(16, 14, 2),
(17, 50, 2),
(18, 0, 2);

-- Đơn hàng mẫu (thanh toán COD)
INSERT INTO Orders (order_id, user_id, receiver_name, receiver_phone, shipping_address, note, total_amount, status, payment_method, payment_status, paid_at, handled_by, created_at) VALUES
(1, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 1049000, 'delivered', 'COD', 'paid', '2026-10-17 13:20:00', 2, '2026-10-15 09:20:00'),
(2, 4, 'Trần Thị Bình', '0912345678', '12 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức', NULL, 14990000, 'delivered', 'COD', 'paid', '2026-10-20 18:05:00', 2, '2026-10-18 14:05:00'),
(3, 5, 'Lê Minh Cường', '0987654321', '45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', NULL, 2689000, 'delivered', 'COD', 'paid', '2026-10-25 00:10:00', 2, '2026-10-22 20:10:00'),
(4, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 2380000, 'delivered', 'COD', 'paid', '2026-10-30 15:30:00', 2, '2026-10-28 11:30:00'),
(5, 4, 'Trần Thị Bình', '0912345678', '12 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức', NULL, 6830000, 'delivered', 'COD', 'paid', '2026-11-04 14:15:00', 2, '2026-11-02 10:15:00'),
(6, 5, 'Lê Minh Cường', '0987654321', '45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', NULL, 7490000, 'delivered', 'COD', 'paid', '2026-11-07 20:40:00', 2, '2026-11-05 16:40:00'),
(7, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 1188000, 'delivered', 'COD', 'paid', '2026-11-11 12:50:00', 2, '2026-11-09 08:50:00'),
(8, 4, 'Trần Thị Bình', '0912345678', '12 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức', NULL, 2080000, 'cancelled', 'COD', 'unpaid', NULL, NULL, '2026-11-11 19:25:00'),
(9, 5, 'Lê Minh Cường', '0987654321', '45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', NULL, 4389000, 'delivered', 'COD', 'paid', '2026-11-16 17:00:00', 2, '2026-11-14 13:00:00'),
(10, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 11990000, 'rejected', 'COD', 'unpaid', NULL, 2, '2026-11-16 10:10:00'),
(11, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 14180000, 'shipping', 'COD', 'unpaid', NULL, 2, '2026-11-18 15:35:00'),
(12, 4, 'Trần Thị Bình', '0912345678', '12 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức', NULL, 1890000, 'confirmed', 'COD', 'unpaid', NULL, 2, '2026-11-20 09:05:00'),
(13, 5, 'Lê Minh Cường', '0987654321', '45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', NULL, 2340000, 'pending', 'COD', 'unpaid', NULL, NULL, '2026-11-21 08:20:00'),
(14, 3, 'Nguyễn Văn An', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', NULL, 2900000, 'pending', 'COD', 'unpaid', NULL, NULL, '2026-11-21 10:45:00');

INSERT INTO Order_Items (order_id, product_id, quantity, unit_price) VALUES
(1, 6, 1, 399000),
(1, 15, 1, 650000),
(2, 1, 1, 14990000),
(3, 4, 1, 2290000),
(3, 6, 1, 399000),
(4, 10, 2, 1190000),
(5, 12, 2, 2690000),
(5, 14, 1, 1450000),
(6, 9, 1, 7490000),
(7, 6, 2, 399000),
(7, 17, 1, 390000),
(8, 5, 1, 1590000),
(8, 8, 1, 490000),
(9, 13, 1, 3990000),
(9, 6, 1, 399000),
(10, 3, 1, 11990000),
(11, 2, 1, 13490000),
(11, 7, 1, 690000),
(12, 11, 1, 1890000),
(13, 16, 1, 1690000),
(13, 15, 1, 650000),
(14, 14, 2, 1450000);

-- Lịch sử trạng thái: mỗi lần đổi trạng thái 1 dòng
INSERT INTO Order_Status_History (order_id, from_status, to_status, note, changed_by, changed_at) VALUES
(1, NULL, 'pending', NULL, 3, '2026-10-15 09:20:00'),
(1, 'pending', 'confirmed', NULL, 2, '2026-10-15 11:20:00'),
(1, 'confirmed', 'shipping', NULL, 2, '2026-10-16 05:20:00'),
(1, 'shipping', 'delivered', NULL, 2, '2026-10-17 13:20:00'),
(2, NULL, 'pending', NULL, 4, '2026-10-18 14:05:00'),
(2, 'pending', 'confirmed', NULL, 2, '2026-10-18 16:05:00'),
(2, 'confirmed', 'shipping', NULL, 2, '2026-10-19 10:05:00'),
(2, 'shipping', 'delivered', NULL, 2, '2026-10-20 18:05:00'),
(3, NULL, 'pending', NULL, 5, '2026-10-22 20:10:00'),
(3, 'pending', 'confirmed', NULL, 2, '2026-10-22 22:10:00'),
(3, 'confirmed', 'shipping', NULL, 2, '2026-10-23 16:10:00'),
(3, 'shipping', 'delivered', NULL, 2, '2026-10-25 00:10:00'),
(4, NULL, 'pending', NULL, 3, '2026-10-28 11:30:00'),
(4, 'pending', 'confirmed', NULL, 2, '2026-10-28 13:30:00'),
(4, 'confirmed', 'shipping', NULL, 2, '2026-10-29 07:30:00'),
(4, 'shipping', 'delivered', NULL, 2, '2026-10-30 15:30:00'),
(5, NULL, 'pending', NULL, 4, '2026-11-02 10:15:00'),
(5, 'pending', 'confirmed', NULL, 2, '2026-11-02 12:15:00'),
(5, 'confirmed', 'shipping', NULL, 2, '2026-11-03 06:15:00'),
(5, 'shipping', 'delivered', NULL, 2, '2026-11-04 14:15:00'),
(6, NULL, 'pending', NULL, 5, '2026-11-05 16:40:00'),
(6, 'pending', 'confirmed', NULL, 2, '2026-11-05 18:40:00'),
(6, 'confirmed', 'shipping', NULL, 2, '2026-11-06 12:40:00'),
(6, 'shipping', 'delivered', NULL, 2, '2026-11-07 20:40:00'),
(7, NULL, 'pending', NULL, 3, '2026-11-09 08:50:00'),
(7, 'pending', 'confirmed', NULL, 2, '2026-11-09 10:50:00'),
(7, 'confirmed', 'shipping', NULL, 2, '2026-11-10 04:50:00'),
(7, 'shipping', 'delivered', NULL, 2, '2026-11-11 12:50:00'),
(8, NULL, 'pending', NULL, 4, '2026-11-11 19:25:00'),
(8, 'pending', 'cancelled', 'Khách hàng đổi ý', 4, '2026-11-11 20:25:00'),
(9, NULL, 'pending', NULL, 5, '2026-11-14 13:00:00'),
(9, 'pending', 'confirmed', NULL, 2, '2026-11-14 15:00:00'),
(9, 'confirmed', 'shipping', NULL, 2, '2026-11-15 09:00:00'),
(9, 'shipping', 'delivered', NULL, 2, '2026-11-16 17:00:00'),
(10, NULL, 'pending', NULL, 3, '2026-11-16 10:10:00'),
(10, 'pending', 'rejected', 'Sản phẩm tạm hết hàng, không thể giao trong tuần', 2, '2026-11-16 13:10:00'),
(11, NULL, 'pending', NULL, 3, '2026-11-18 15:35:00'),
(11, 'pending', 'confirmed', NULL, 2, '2026-11-18 17:35:00'),
(11, 'confirmed', 'shipping', NULL, 2, '2026-11-19 11:35:00'),
(12, NULL, 'pending', NULL, 4, '2026-11-20 09:05:00'),
(12, 'pending', 'confirmed', NULL, 2, '2026-11-20 11:05:00'),
(13, NULL, 'pending', NULL, 5, '2026-11-21 08:20:00'),
(14, NULL, 'pending', NULL, 3, '2026-11-21 10:45:00');

-- Giỏ hàng mẫu của khách an@gmail.com (user_id 3)
INSERT INTO Carts (cart_id, user_id) VALUES (1, 3);
INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (1, 7, 1), (1, 12, 1);
