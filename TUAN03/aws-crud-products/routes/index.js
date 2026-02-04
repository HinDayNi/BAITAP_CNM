import express from 'express';
import * as authController from '../controllers/authController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/products');
  } else {
    res.redirect('/login');
  }
});

router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

router.get('/register', authController.getRegisterPage);
router.post('/register', authController.postRegister);

export default router;
