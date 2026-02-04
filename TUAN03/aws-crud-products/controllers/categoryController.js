import * as categoryService from '../services/categoryService.js';

export const listCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.render('categories/list', {
            title: 'Categories',
            categories,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const getAddCategory = (req, res) => {
    res.render('categories/add', { title: 'Add Category', user: req.session.user });
};

export const postAddCategory = async (req, res) => {
    try {
        await categoryService.createCategory(req.body.name, req.body.description);
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send("Error adding category");
    }
};

export const getEditCategory = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.render('categories/edit', { title: 'Edit Category', category, user: req.session.user });
    } catch (error) {
        res.redirect('/categories');
    }
};

export const postEditCategory = async (req, res) => {
    try {
        await categoryService.updateCategory(req.body.categoryId, req.body.name, req.body.description);
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send("Error updating category");
    }
};

// Implement Delete logic
export const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
};
