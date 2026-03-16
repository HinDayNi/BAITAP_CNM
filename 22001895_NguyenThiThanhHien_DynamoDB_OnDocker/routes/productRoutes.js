const express = require("express");
const { body } = require("express-validator");
const upload = require("../middlewares/upload");
const controller = require("../controllers/productController");

const router = express.Router();

const productValidation = [
    body("name").trim().notEmpty().withMessage("Tên sản phẩm không được để trống"),
    body("price").isFloat({ min: 0 }).withMessage("Giá phải >= 0"),
    body("unit_in_stock").isInt({ min: 0 }).withMessage("Số lượng tồn phải là số nguyên >= 0")
];

router.get("/", controller.list);
router.get("/new", controller.showCreate);
router.post("/", upload.single("url_image"), productValidation, controller.create);
router.get("/:id", controller.detail);
router.get("/:id/edit", controller.showEdit);
router.post("/:id/edit", upload.single("url_image"), productValidation, controller.update);
router.post("/:id/delete", controller.remove);

router.get("/products/:id/edit", controller.showEdit);
router.post("/products/:id/edit", upload.single("url_image"), productValidation, controller.update);

module.exports = router;