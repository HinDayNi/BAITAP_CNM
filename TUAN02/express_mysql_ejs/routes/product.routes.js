const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// Home
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM products');
    res.render('products', { products: rows });
});

// Add product
router.post('/add', async (req, res) => {
    const { name, price, quantity } = req.body;
    await db.query(
        'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
        [name, price, quantity]
    );
    res.redirect('/');
});

// Delete
router.get('/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Load Edit Form
router.get('/edit/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.send('Product not found');
        res.render('edit', { product: rows[0] });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Save Update
router.post('/update/:id', async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        await db.query(
            'UPDATE products SET name=?, price=?, quantity=? WHERE id=?',
            [name, price, quantity, req.params.id]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
