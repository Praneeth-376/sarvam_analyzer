const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Branch = require('../models/Branch');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET enterprise report (master)
router.get('/enterprise', auth, authorize('master'), async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true });
        const report = [];

        for (const branch of branches) {
            const sales = await Sale.aggregate([
                { $match: { branchId: branch._id } },
                { $group: { _id: null, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } }
            ]);
            const expenses = await Expense.aggregate([
                { $match: { branchId: branch._id } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            report.push({
                branch: branch.name,
                location: branch.location,
                revenue: sales[0]?.revenue || 0,
                profit: sales[0]?.profit || 0,
                expenses: expenses[0]?.total || 0,
                netProfit: (sales[0]?.profit || 0) - (expenses[0]?.total || 0),
                salesCount: sales[0]?.count || 0
            });
        }

        res.json(report);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET branch report (admin)
router.get('/branch', auth, authorize('admin', 'master'), async (req, res) => {
    try {
        const branchId = req.query.branchId || req.user.branchId;
        const sales = await Sale.find({ branchId }).populate('workerId', 'name').sort({ date: -1 }).limit(100);
        const expenses = await Expense.find({ branchId }).sort({ date: -1 }).limit(100);

        const salesTotal = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const profitTotal = sales.reduce((sum, s) => sum + s.profit, 0);
        const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

        res.json({
            sales,
            expenses,
            summary: {
                totalRevenue: salesTotal,
                totalProfit: profitTotal,
                totalExpenses: expenseTotal,
                netProfit: profitTotal - expenseTotal,
                salesCount: sales.length
            }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
