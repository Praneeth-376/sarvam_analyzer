const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET products (master sees all, admin/worker see their branch)
router.get('/', auth, async (req, res) => {
    try {
        let filter = { isActive: true };
        if (req.user.role === 'admin' || req.user.role === 'worker') {
            filter.branchId = req.user.branchId;
        }
        if (req.query.branchId) filter.branchId = req.query.branchId;

        const products = await Product.find(filter)
            .populate('branchId', 'name')
            .sort({ name: 1 });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create product (admin+)
router.post('/', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const { name, sku, category, costPrice, sellingPrice, branchId, stock, minStock } = req.body;
        const bid = req.user.role === 'admin' ? req.user.branchId : branchId;

        if (!name || !costPrice || !sellingPrice) {
            return res.status(400).json({ msg: 'Name, cost price, and selling price are required' });
        }

        const product = new Product({
            name,
            sku: sku || `${name.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}`,
            category: category || 'General',
            costPrice,
            sellingPrice,
            branchId: bid,
            stock: stock || 0,
            minStock: minStock || 5
        });
        await product.save();
        const populated = await Product.findById(product._id).populate('branchId', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update product (admin+)
router.put('/:id', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('branchId', 'name');
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE product (soft delete)
router.delete('/:id', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json({ msg: 'Product deleted', _id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
