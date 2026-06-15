const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET sales (scoped by role)
router.get('/', auth, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'worker') {
            filter.workerId = req.user.id;
        } else if (req.user.role === 'admin') {
            filter.branchId = req.user.branchId;
        }
        if (req.query.branchId) filter.branchId = req.query.branchId;
        if (req.query.status) filter.status = req.query.status;

        const sales = await Sale.find(filter)
            .populate('productId', 'name sku')
            .populate('branchId', 'name')
            .populate('workerId', 'name email')
            .sort({ _id: -1 })
            .limit(200);
        res.json(sales);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST record sale (worker/admin)
router.post('/', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ msg: 'Product and quantity are required' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (!product.isActive) return res.status(400).json({ msg: 'Product is no longer available' });
        if (product.stock < quantity) return res.status(400).json({ msg: `Insufficient stock. Only ${product.stock} available.` });

        const totalAmount = product.sellingPrice * quantity;
        const profit = (product.sellingPrice - product.costPrice) * quantity;

        const sale = new Sale({
            productId,
            productName: product.name,
            branchId: product.branchId,
            workerId: req.user.id,
            quantity,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            totalAmount,
            profit,
            status: 'completed'
        });

        product.stock -= quantity;
        await product.save();
        await sale.save();

        const populated = await Sale.findById(sale._id)
            .populate('productId', 'name sku')
            .populate('branchId', 'name')
            .populate('workerId', 'name email');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update sale status (admin+)
router.put('/:id/status', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ msg: 'Sale not found' });

        // If cancelling, restore stock
        if (status === 'cancelled' && sale.status !== 'cancelled') {
            const product = await Product.findById(sale.productId);
            if (product) {
                product.stock += sale.quantity;
                await product.save();
            }
        }

        sale.status = status;
        await sale.save();

        const populated = await Sale.findById(sale._id)
            .populate('productId', 'name sku')
            .populate('branchId', 'name')
            .populate('workerId', 'name email');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
