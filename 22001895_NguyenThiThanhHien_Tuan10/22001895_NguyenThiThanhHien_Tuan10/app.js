require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');

// Khởi tạo ứng dựng Express
const app = express();

// CẤU HÌNH VIEW ENGINE (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MIDDLEWARES HỆ THỐNG
// Ghi log requests ra terminal (chế độ dev)
app.use(morgan('dev'));

// Xử lý dữ liệu gửi từ Form (POST body)
app.use(express.urlencoded({ extended: false }));

// Cho phép truy cập file tĩnh (css, js, images) trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// ĐỊNH TUYẾN (ROUTING)
const productRoutes = require("./routes/productRoutes");
app.use("/", productRoutes);

// XỬ LÝ LỖI (ERROR HANDLING)
// Bắt lỗi trang không tồn tại (404)
app.use((req, res, next) => {
    res.status(404).send("Trang bạn tìm không tồn tại (404)");
});

// Bắt lỗi hệ thống (500)
app.use((err, req, res, next) => {
    console.error("Lỗi hệ thống phát sinh:", err.stack);
    res.status(500).send("Có lỗi hệ thống xảy ra!");
});

// KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`Kết nối AWS S3 và DynamoDB thành công`);
    console.log(`=========================================`);
});
