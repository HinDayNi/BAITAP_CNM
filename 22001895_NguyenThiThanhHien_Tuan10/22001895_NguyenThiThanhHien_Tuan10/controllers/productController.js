const productModel = require("../models/productModel")
const { s3Client } = require("../config/aws")
const { PutObjectCommand } = require("@aws-sdk/client-s3")

const BUCKET = process.env.S3_BUCKET
const REGION = process.env.AWS_REGION

async function uploadToS3(file) {
    const key = `images/${Date.now()}-${file.originalname}`;
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    }));
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

// Kiểm tra file ảnh hợp lệ
function isValidImage(file){
    if(!file)
        return true // Cho phép giữ ảnh cũ
    const types = ["image/jpeg", "image/png", "image/jpg"]
    return types.includes(file.mimetype)
}

// Hiển thị danh sách sản phẩm
async function getAllProducts(req, res){
    try {
        const products = await productModel.getAllProduct()
        res.render("list", {products})
    } catch (error) {
        res.send("Lỗi hiển thị danh sách sản phẩm")
    }
}

// Hiển thị form thêm sản phẩm
function showAddProductForm(req, res){
    res.render("add")
}

// Thêm sản phẩm
async function addProduct(req, res){
    try{
        const {ID, name, price, quantity, image} = req.body
        // Kiểm tra data
        if(name === ""){
            return res.send("Tên sản phẩm không được để trống")
        } 

        if(price <= 0){
            return res.send("Giá sản phẩm phải lớn hơn 0")
        }

        if(quantity < 0){
            return res.send("Số lượng sản phẩm phải lớn hơn hoặc bằng 0")
        }

        if(!isValidImage(req.file)){
            return res.send("Chỉ chấp nhận file ảnh có định dạng JPEG, PNG hoặc JPG")
        }

        // Upload ảnh lên S3 nếu có
        let imageUrl = ""
        if(req.file) {
            imageUrl = await uploadToS3(req.file)
        }

        const product = {
            ID: Date.now().toString(), // Tạo ID tự động
            name: name,
            price: Number(price),
            quantity: Number(quantity),
            image: imageUrl
        }

        await productModel.addProduct(product)
        res.redirect("/")
    } catch (error) {
        console.log(error)
        res.send("Thêm sản phẩm thất bại")
    }}

    // Hiển thị form chỉnh sửa sản phẩm
    async function showEditProductForm(req, res){
        try {
            const id = req.params.id
            const product = await productModel.getProductById(id)
            if(!product){
                return res.send("Không tìm thấy sản phẩm")
            }
            res.render("edit", {product})
        } catch (error) {
            console.log(error)
            res.send("Lỗi hiển thị form chỉnh sửa sản phẩm")
        }
    }

    // Cập nhật sản phẩm
    async function updateProduct(req, res) {
        try {
            const id = req.params.id
            const {name, price, quantity, oldImage} = req.body

            // Kiểm tra data
            if(!name){
                return res.send("Tên sản phẩm không được để trống")
            } 

            if(price <= 0){
                return res.send("Giá sản phẩm phải lớn hơn 0")
            }

            if(quantity < 0){
                return res.send("Số lượng sản phẩm phải lớn hơn hoặc bằng 0")
            }

            // Upload ảnh mới lên S3 nếu có
            let imageUrl = oldImage
            if(req.file) {
                imageUrl = await uploadToS3(req.file)
            }

            const product = {
                name: name,
                price: Number(price),
                quantity: Number(quantity),
                image: imageUrl
            }

            await productModel.updateProduct(id, product)
            res.redirect("/")
        } catch (error) {
            console.log(error)
            res.send("Cập nhật sản phẩm thất bại")
        }
    }

// Xóa sản phẩm
async function deleteProduct(req, res) {
    try {
        const id = req.params.id
       const product = await productModel.getProductById(id)
       
        if(!product){
            return res.send("Không tìm thấy sản phẩm")
        }

        await productModel.deleteProduct(id)
        res.redirect("/")
    } catch (error) {
        res.send("Xóa sản phẩm thất bại")
    }
}

// Tìm kiếm sản phẩm
async function searchProducts(req, res) {
    try {
        const keyword = req.query.keyword
        const products = await productModel.searchProduct(keyword)
        
        if(!products || products.length === 0){
            return res.send("Không tìm thấy sản phẩm nào")
        }

        res.render("list", {products})
    } catch (error) {
        res.send("Lỗi tìm kiếm sản phẩm")
    }
}

module.exports = {
    getAllProducts,
    showAddProductForm,
    addProduct,
    showEditProductForm,
    updateProduct,
    deleteProduct,
    searchProducts
}
