const productModel = require("../model/productModel");

const renderHome = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.render("index", { products });
    } catch (error) {
        res.status(500).send("Error fetching products");
    }
};

const renderAddPage = (req, res) => {
    res.render("add");
};

const addProduct = async (req, res) => {
    let { id, name, price } = req.body;
    let url_image = '/images/default.png'; // Default image

    if (req.file) {
        url_image = `/images/uploads/${req.file.filename}`;
    }

    if (!id) id = Date.now().toString();

    try {
        await productModel.saveProduct(id, name, price, url_image);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error adding product");
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.body;
    try {
        await productModel.deleteProduct(id);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error deleting product");
    }
};

const renderEditPage = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.getProductById(id);
        if (product) {
            res.render("edit", { product });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        res.status(500).send("Error fetching product for edit");
    }
};

const updateProduct = async (req, res) => {
    const { id, name, price, old_image } = req.body;
    let url_image = old_image;

    if (req.file) {
        url_image = `/images/uploads/${req.file.filename}`;
    }

    try {
        await productModel.saveProduct(id, name, price, url_image);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error updating product");
    }
};

module.exports = { renderHome, renderAddPage, addProduct, deleteProduct, renderEditPage, updateProduct };
