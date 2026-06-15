const express = require('express');
const router = express.Router();
const StockRequest = require('../models/StockRequest');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET stock requests
router.get('/', auth, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'worker') {
            filter.requestedBy = req.user.id;
        } else if (req.user.role === 'admin') {
            filter.branchId = req.user.branchId;
        }

        const requests = await StockRequest.find(filter)
            .populate('productId', 'name sku stock')
            .populate('requestedBy', 'name email')
            .populate('branchId', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create stock request (worker/admin)
router.post('/', auth, async (req, res) => {
    try {
        const { productId, quantity, type, reason } = req.body;
        if (!productId || !quantity || !type) {
            return res.status(400).json({ msg: 'Product, quantity, and type are required' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const request = new StockRequest({
            productId,
            branchId: product.branchId,
            requestedBy: req.user.id,
            quantity,
            type,
            reason: reason || ''
        });
        await request.save();

        const populated = await StockRequest.findById(request._id)
            .populate('productId', 'name sku stock')
            .populate('requestedBy', 'name email')
            .populate('branchId', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT approve/reject stock request (admin+)
router.put('/:id/status', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Status must be approved or rejected' });
        }

        const request = await StockRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        request.status = status;

        if (status === 'approved' && request.type === 'refill') {
            const product = await Product.findById(request.productId);
            if (product) {
                product.stock += request.quantity;
                await product.save();
            }
        }

        await request.save();

        const populated = await StockRequest.findById(request._id)
            .populate('productId', 'name sku stock')
            .populate('requestedBy', 'name email')
            .populate('branchId', 'name');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
