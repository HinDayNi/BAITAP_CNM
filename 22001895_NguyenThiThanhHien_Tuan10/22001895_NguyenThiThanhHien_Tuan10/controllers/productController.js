const model = require("../models/productModel");
const { s3Client, S3_BUCKET, REGION } = require("../config/aws");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// LƯU Ý: Những hàm helper đi thi không bắt buộc nếu bạn không nhớ, nhưng nó giúp code sạch hơn
async function uploadS3(file) {
    if (!file) return "";
    const key = `img-${Date.now()}`;
    await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype
    }));
    return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

async function deleteS3(url) {
    if (!url || !url.includes(".amazonaws.com/")) return;
    const key = url.split(".amazonaws.com/")[1];
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

// XỬ LÝ CHÍNH
const list = async (req, res) => {
    let products = await model.getAllProduct();
    // Phân trang đơn giản
    const page = parseInt(req.query.page) || 1;
    const items = products.slice((page - 1) * 5, page * 5);
    res.render("list", { products: items, currentPage: page, totalPages: Math.ceil(products.length / 5), totalProducts: products.length, keyword: "" });
};

const find = async (req, res) => {
    const kw = req.query.keyword || "";
    const resArr = await model.searchProduct(kw);
    const page = parseInt(req.query.page) || 1;
    const items = resArr.slice((page - 1) * 5, page * 5);
    res.render("list", { products: items, currentPage: page, totalPages: Math.ceil(resArr.length / 5), totalProducts: resArr.length, keyword: kw });
};

const add = async (req, res) => {
    const { ID, name, price, quantity } = req.body;
    if (!ID || !name) return res.send("Vui lòng nhập đủ!");
    const image = await uploadS3(req.file);
    await model.addProduct({ ID, name, price: Number(price), quantity: Number(quantity), image });
    res.redirect("/");
};

const edit = async (req, res) => {
    const p = await model.getProductById(req.params.id);
    res.render("edit", { product: p });
};

const update = async (req, res) => {
    const { name, price, quantity, oldImage } = req.body;
    let image = oldImage;
    if (req.file) {
        image = await uploadS3(req.file);
        await deleteS3(oldImage);
    }
    await model.updateProduct(req.params.id, { name, price, quantity, image });
    res.redirect("/");
};

const remove = async (req, res) => {
    const p = await model.getProductById(req.params.id);
    if (p) { await deleteS3(p.image); await model.deleteProduct(req.params.id); }
    res.redirect("/");
};

module.exports = { list, find, add, edit: (req, res) => res.render("add"), showEdit: edit, update, remove };
