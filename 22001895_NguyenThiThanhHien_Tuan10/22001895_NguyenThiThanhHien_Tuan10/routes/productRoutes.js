const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() }) // Lưu file vào bộ nhớ tạm thời

const productController = require("../controllers/productController")

// Hiển thị danh sách sản phẩm
router.get("/", productController.getAllProducts)

// Hiển thị form thêm sản phẩm
router.get("/add", productController.showAddProductForm)

// Thêm sản phẩm
router.post("/add", upload.single("image"), productController.addProduct)

// Hiển thị form sửa sản phẩm
router.get("/edit/:id", productController.showEditProductForm)

// Cập nhật sản phẩm
router.post("/edit/:id", upload.single("image"), productController.updateProduct)

// Xóa sản phẩm
router.get("/delete/:id", productController.deleteProduct)

// Tìm kiếm sản phẩm
router.get("/search", productController.searchProducts)

module.exports = router