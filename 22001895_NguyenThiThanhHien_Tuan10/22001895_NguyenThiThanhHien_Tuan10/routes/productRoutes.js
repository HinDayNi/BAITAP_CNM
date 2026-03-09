const express = require("express");
const router = express.Router();
const multer = require("multer");
const ctrl = require("../controllers/productController");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", ctrl.list);
router.get("/search", ctrl.find);
router.get("/add", ctrl.edit); // Show form add
router.post("/add", upload.single("image"), ctrl.add); // Save add
router.get("/edit/:id", ctrl.showEdit);
router.post("/edit/:id", upload.single("image"), ctrl.update);
router.get("/delete/:id", ctrl.remove);

module.exports = router;