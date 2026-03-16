require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const productRoutes = require("./routes/productRoutes");
const { initTable } = require("./scripts/initTable");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", productRoutes);

app.use((err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).send("File ảnh quá lớn. Vui lòng chọn ảnh tối đa 5MB.");
        }
        return res.status(400).send(`Lỗi upload: ${err.message}`);
    }

    if (err && err.message === "Chỉ cho phép file ảnh") {
        return res.status(400).send(err.message);
    }

    return next(err);
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).send("Đã xảy ra lỗi hệ thống.");
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    await initTable();
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
}

startServer().catch((err) => {
    console.error("Khoi dong that bai:", err);
    process.exit(1);
});