// Kết nối MySQL dùng chung (connection pool) — PHẦN CHUNG
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hdx_tech',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, // DECIMAL trả về number
  dateStrings: true, // DATETIME trả về chuỗi 'YYYY-MM-DD HH:mm:ss', tránh lệch múi giờ
});

module.exports = pool;
