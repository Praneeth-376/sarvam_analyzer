const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET expenses (scoped by role)
router.get('/', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'admin') {
            filter.branchId = req.user.branchId;
        }
        if (req.query.branchId) filter.branchId = req.query.branchId;
        const expenses = await Expense.find(filter)
            .populate('branchId', 'name')
            .populate('addedBy', 'name email')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create expense (admin+)
router.post('/', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const { branchId, category, amount, description } = req.body;
        const bid = req.user.role === 'admin' ? req.user.branchId : branchId;
        const expense = new Expense({ branchId: bid, category, amount, description, addedBy: req.user.id });
        await expense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE expense (admin+)
router.delete('/:id', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
