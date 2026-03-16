const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Product = require("../models/productModel");

function removeImageIfExists(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
    const fullPath = path.join(__dirname, "..", "public", imageUrl.replace(/^\//, ""));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

exports.list = async(req, res) => {
    const q = (req.query.q || "").trim();
    const products = await Product.getAll(q);
    res.render("index", {
        products,
        q,
        msg: req.query.msg || "",
        err: req.query.err || ""
    });
};

exports.showCreate = (_req, res) => {
    res.render("create", { errors: [], oldData: {} });
};

exports.create = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.file) removeImageIfExists(`/uploads/${req.file.filename}`);
        return res.render("create", {
            errors: errors.array(),
            oldData: req.body
        });
    }

    const product = {
        id: uuidv4(),
        name: req.body.name.trim(),
        price: Number(req.body.price),
        unit_in_stock: Number(req.body.unit_in_stock),
        url_image: req.file ? `/uploads/${req.file.filename}` : ""
    };

    await Product.create(product);
    res.redirect("/?msg=Thêm sản phẩm thành công");
};

exports.detail = async(req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
    res.render("detail", { product });
};

exports.showEdit = async(req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
    res.render("edit", { product, errors: [] });
};

exports.update = async(req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.file) removeImageIfExists(`/uploads/${req.file.filename}`);
        return res.render("edit", {
            product: {...product, ...req.body },
            errors: errors.array()
        });
    }

    let newImage = product.url_image || "";
    if (req.file) {
        newImage = `/uploads/${req.file.filename}`;
        removeImageIfExists(product.url_image);
    }

    await Product.update({
        id: product.id,
        name: req.body.name.trim(),
        price: Number(req.body.price),
        unit_in_stock: Number(req.body.unit_in_stock),
        url_image: newImage
    });

    res.redirect("/?msg=Cập nhật sản phẩm thành công");
};

exports.remove = async(req, res) => {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

    await Product.remove(req.params.id);
    removeImageIfExists(product.url_image);
    res.redirect("/?msg=Xóa sản phẩm thành công");
};