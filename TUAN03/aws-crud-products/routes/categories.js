import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', categoryController.listCategories);

// Only admin can manage categories
router.get('/add', hasRole('admin'), categoryController.getAddCategory);
router.post('/add', hasRole('admin'), categoryController.postAddCategory);
router.get('/edit/:id', hasRole('admin'), categoryController.getEditCategory);
router.post('/edit', hasRole('admin'), categoryController.postEditCategory);
router.get('/delete/:id', hasRole('admin'), categoryController.deleteCategory);

export default router;
