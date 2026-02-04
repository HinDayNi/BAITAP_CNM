import express from 'express';
import multer from 'multer';
import * as productController from '../controllers/productController.js';
import { isAuthenticated, hasRole } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer();

router.use(isAuthenticated);

router.get('/', productController.listProducts);

// Admin only for write operations
router.get('/add', hasRole('admin'), productController.getAddProduct);
router.post('/add', hasRole('admin'), upload.single('image'), productController.postAddProduct);

router.get('/edit/:id', hasRole('admin'), productController.getEditProduct);
router.post('/edit', hasRole('admin'), upload.single('image'), productController.postEditProduct);

router.get('/delete/:id', hasRole('admin'), productController.deleteProduct);

export default router;
