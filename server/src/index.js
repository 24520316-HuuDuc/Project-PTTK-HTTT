// Điểm khởi động API — PHẦN CHUNG
require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = Number(process.env.PORT) || 3001;

pool
  .query('SELECT 1')
  .then(() => console.log(`Đã kết nối MySQL (database: ${process.env.DB_NAME || 'hdx_tech'})`))
  .catch((err) => console.error('KHÔNG kết nối được MySQL, kiểm tra file .env:', err.message));

app.listen(PORT, () => {
  console.log(`API HDX Tech đang chạy tại http://localhost:${PORT}/api`);
});
