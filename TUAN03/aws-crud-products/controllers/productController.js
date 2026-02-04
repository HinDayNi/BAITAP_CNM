import * as productService from '../services/productService.js';
import * as categoryService from '../services/categoryService.js';

export const listProducts = async (req, res) => {
    try {
        const filters = {
            categoryId: req.query.categoryId,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            name: req.query.name,
            limit: 1000 // Scan all matching items to ensure search works across "pages"
        };

        const { products: allProducts } = await productService.getAllProducts(filters);

        // In-Memory Pagination Logic
        const page = parseInt(req.query.page) || 1;
        const limit = 2; // Reduced to 2 so pagination appears with few items
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedProducts = allProducts.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allProducts.length / limit);

        const categories = await categoryService.getAllCategories();

        res.render('products/index', {
            title: 'Product List',
            products: paginatedProducts,
            categories,
            filters,
            user: req.session.user,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error(error);
        res.render('products/index', {
            title: 'Product List',
            products: [],
            categories: [],
            filters: {},
            user: req.session.user,
            error: error.message
        });
    }
};

export const getAddProduct = async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.render('products/add', { title: 'Add Product', categories, user: req.session.user });
};

export const postAddProduct = async (req, res) => {
    try {
        await productService.createProduct(req.body, req.file, req.session.user.userId);
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        const categories = await categoryService.getAllCategories();
        res.render('products/add', {
            title: 'Add Product',
            categories,
            error: error.message,
            user: req.session.user
        });
    }
};

export const getEditProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        const categories = await categoryService.getAllCategories();
        res.render('products/edit', {
            product,
            categories,
            title: 'Edit Product',
            user: req.session.user
        });
    } catch (error) {
        res.redirect('/products');
    }
};

export const postEditProduct = async (req, res) => {
    try {
        await productService.updateProduct(req.body.id, req.body, req.file, req.session.user.userId);
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.redirect('/products');
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.session.user.userId);
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.redirect('/products');
    }
};
