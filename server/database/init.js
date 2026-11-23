// Khởi tạo CSDL: tạo database, 9 bảng, tài khoản mẫu và dữ liệu mẫu.
// Chạy: npm run db:init   (CẢNH BÁO: xóa sạch dữ liệu cũ của database này)
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_NAME = process.env.DB_NAME || 'hdx_tech';

// Mật khẩu mặc định của mọi tài khoản mẫu: 123456
const SAMPLE_USERS = [
  ['Lê Quản Lý', 'admin@hdxtech.vn', '0909000001', 'TP. Thủ Đức', 'manager'],
  ['Phạm Nhân Viên', 'nhanvien@hdxtech.vn', '0909000002', 'TP. Thủ Đức', 'employee'],
  ['Nguyễn Văn An', 'an@gmail.com', '0901234567', 'KTX Khu B, ĐHQG TP.HCM, Dĩ An, Bình Dương', 'customer'],
  ['Trần Thị Bình', 'binh@gmail.com', '0912345678', '12 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức', 'customer'],
  ['Lê Minh Cường', 'cuong@gmail.com', '0987654321', '45 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức', 'customer'],
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${DB_NAME}\``);
  await conn.query('SET NAMES utf8mb4');

  console.log('1/3 Tạo 9 bảng...');
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  console.log('2/3 Tạo tài khoản mẫu (mật khẩu: 123456)...');
  const hash = bcrypt.hashSync('123456', 10);
  for (const [fullName, email, phone, address, role] of SAMPLE_USERS) {
    await conn.query(
      'INSERT INTO Users (full_name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hash, phone, address, role]
    );
  }

  console.log('3/3 Thêm sản phẩm, đơn hàng mẫu...');
  await conn.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));

  await conn.end();
  console.log(`\nXong! Database "${DB_NAME}" đã sẵn sàng. Tài khoản mẫu:`);
  SAMPLE_USERS.forEach(([, email, , , role]) => console.log(`  ${role.padEnd(9)} ${email} / 123456`));
}

main().catch((err) => {
  console.error('Lỗi khởi tạo CSDL:', err.message);
  process.exit(1);
});
