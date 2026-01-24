const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === '123456') {
        req.session.user = username;
        return res.redirect('/');
    }

    res.send('Sai tài khoản hoặc mật khẩu');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
