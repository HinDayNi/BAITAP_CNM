const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const upload = require("../middleware/upload");

router.get("/", productController.renderHome);
router.get("/add", productController.renderAddPage);
router.post("/add", upload, productController.addProduct);
router.post("/delete", productController.deleteProduct);
router.get("/edit/:id", productController.renderEditPage);
router.post("/update", upload, productController.updateProduct);

module.exports = router;
