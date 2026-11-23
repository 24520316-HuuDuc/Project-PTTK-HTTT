// Cấu hình Express — PHẦN CHUNG
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// 4 module, mỗi người một module
app.use('/api', require('./modules/accounts/account.routes')); // TV1
app.use('/api', require('./modules/products/product.routes')); // TV2
app.use('/api', require('./modules/shopping/shopping.routes')); // TV3
app.use('/api', require('./modules/admin/admin.routes')); // TV4

app.use('/api', notFound);

// Khi đã build client (npm run build trong thư mục client) thì server phục vụ luôn giao diện,
// chỉ cần chạy 1 lệnh để demo.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
