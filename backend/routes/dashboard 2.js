const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const User = require('../models/User');
const StockRequest = require('../models/StockRequest');
const { auth, authorize } = require('../middleware/authMiddleware');

// ──────────────────────────────────────────────
// MASTER DASHBOARD
// ──────────────────────────────────────────────
router.get('/master', auth, authorize('master'), async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true });
        const totalSales = await Sale.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } }
        ]);
        const totalExpenses = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWorkers = await User.countDocuments({ role: 'worker', isActive: true });
        const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const pendingRequests = await StockRequest.countDocuments({ status: 'pending' });

        // Branch-wise revenue
        const branchRevenue = await Sale.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$branchId', revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, sales: { $sum: 1 } } }
        ]);

        // Populate branch names
        const branchMap = {};
        branches.forEach(b => { branchMap[b._id.toString()] = b.name; });
        const branchRevenueNamed = branchRevenue.map(b => ({
            ...b,
            branchName: branchMap[b._id?.toString()] || 'Unknown'
        }));

        // Branch-wise expenses
        const branchExpenses = await Expense.aggregate([
            { $group: { _id: '$branchId', total: { $sum: '$amount' } } }
        ]);
        const branchExpensesNamed = branchExpenses.map(b => ({
            ...b, branchName: branchMap[b._id?.toString()] || 'Unknown'
        }));

        // Category-wise sales
        const categorySales = await Sale.aggregate([
            { $match: { status: 'completed' } },
            { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { revenue: -1 } }
        ]);

        // Expense categories breakdown
        const expenseCategories = await Expense.aggregate([
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        // Top products
        const topProducts = await Sale.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$productName', totalSold: { $sum: '$quantity' }, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' } } },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        // Monthly sales trend (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const monthlySales = await Sale.aggregate([
            { $match: { date: { $gte: twelveMonthsAgo }, status: 'completed' } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    revenue: { $sum: '$totalAmount' },
                    profit: { $sum: '$profit' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Monthly expenses trend
        const monthlyExpenses = await Expense.aggregate([
            { $match: { date: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            totalRevenue: totalSales[0]?.total || 0,
            totalProfit: totalSales[0]?.profit || 0,
            totalSalesCount: totalSales[0]?.count || 0,
            totalExpenses: totalExpenses[0]?.total || 0,
            netProfit: (totalSales[0]?.profit || 0) - (totalExpenses[0]?.total || 0),
            totalBranches: branches.length,
            totalWorkers,
            totalAdmins,
            totalProducts,
            pendingRequests,
            branchRevenue: branchRevenueNamed,
            branchExpenses: branchExpensesNamed,
            categorySales,
            expenseCategories,
            topProducts,
            monthlySales,
            monthlyExpenses,
            branches
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ADMIN DASHBOARD
// ──────────────────────────────────────────────
router.get('/admin', auth, authorize('admin'), async (req, res) => {
    try {
        const branchId = new mongoose.Types.ObjectId(req.user.branchId);

        const sales = await Sale.aggregate([
            { $match: { branchId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } }
        ]);
        const expenses = await Expense.aggregate([
            { $match: { branchId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const productCount = await Product.countDocuments({ branchId, isActive: true });
        const workerCount = await User.countDocuments({ branchId, role: 'worker', isActive: true });
        const pendingSales = await Sale.countDocuments({ branchId, status: 'pending' });
        const pendingRequests = await StockRequest.countDocuments({ branchId, status: 'pending' });

        // Top workers
        const topWorkers = await Sale.aggregate([
            { $match: { branchId, status: 'completed' } },
            { $group: { _id: '$workerId', totalSales: { $sum: '$totalAmount' }, saleCount: { $sum: 1 } } },
            { $sort: { totalSales: -1 } }, { $limit: 10 }
        ]);
        const workerIds = topWorkers.map(w => w._id);
        const workersData = await User.find({ _id: { $in: workerIds } }).select('name email');
        const workerMap = {};
        workersData.forEach(w => { workerMap[w._id.toString()] = w.name || w.email; });
        const topWorkersNamed = topWorkers.map(w => ({
            ...w, workerName: workerMap[w._id?.toString()] || 'Unknown'
        }));

        // Expense categories
        const expCategories = await Expense.aggregate([
            { $match: { branchId } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        // Monthly trend (6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlySales = await Sale.aggregate([
            { $match: { branchId, date: { $gte: sixMonthsAgo }, status: 'completed' } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Category sales
        const categorySales = await Sale.aggregate([
            { $match: { branchId, status: 'completed' } },
            { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { revenue: -1 } }
        ]);

        res.json({
            branchRevenue: sales[0]?.total || 0,
            branchProfit: sales[0]?.profit || 0,
            branchExpenses: expenses[0]?.total || 0,
            salesCount: sales[0]?.count || 0,
            productCount, workerCount, pendingSales, pendingRequests,
            topWorkers: topWorkersNamed,
            expenseCategories: expCategories,
            monthlySales,
            categorySales,
            netProfit: (sales[0]?.profit || 0) - (expenses[0]?.total || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// WORKER DASHBOARD
// ──────────────────────────────────────────────
router.get('/worker', auth, async (req, res) => {
    try {
        const workerId = new mongoose.Types.ObjectId(req.user.id);
        const branchId = req.user.branchId;

        const sales = await Sale.aggregate([
            { $match: { workerId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = await Sale.aggregate([
            { $match: { workerId, date: { $gte: today }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const user = await User.findById(req.user.id).select('salesTarget name');
        const productsCount = await Product.countDocuments({ branchId, isActive: true });
        const pendingRequests = await StockRequest.countDocuments({ requestedBy: workerId, status: 'pending' });

        const recentSales = await Sale.find({ workerId })
            .sort({ date: -1 }).limit(20)
            .select('productName quantity totalAmount date status');

        // Daily sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailySales = await Sale.aggregate([
            { $match: { workerId, date: { $gte: thirtyDaysAgo }, status: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    total: { $sum: '$totalAmount' }, count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Category breakdown
        const categorySales = await Sale.aggregate([
            { $match: { workerId, status: 'completed' } },
            { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { revenue: -1 } }
        ]);

        res.json({
            mySalesTotal: sales[0]?.total || 0,
            mySalesCount: sales[0]?.count || 0,
            todaySales: todaySales[0]?.total || 0,
            todaySalesCount: todaySales[0]?.count || 0,
            salesTarget: user?.salesTarget || 100000,
            name: user?.name || '',
            productsCount, pendingRequests,
            recentSales, dailySales, categorySales
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ML FORECAST (Linear Regression Prediction)
// ──────────────────────────────────────────────
router.get('/forecast', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        let matchFilter = { date: { $gte: twelveMonthsAgo }, status: 'completed' };
        if (req.user.role === 'admin') {
            matchFilter.branchId = new mongoose.Types.ObjectId(req.user.branchId);
        }

        const monthlySales = await Sale.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    revenue: { $sum: '$totalAmount' },
                    profit: { $sum: '$profit' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Simple linear regression
        const n = monthlySales.length;
        if (n < 3) {
            return res.json({ historical: monthlySales, predictions: [], trend: 'insufficient_data' });
        }

        const revenues = monthlySales.map(m => m.revenue);
        const xValues = revenues.map((_, i) => i);

        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = revenues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((acc, x, i) => acc + x * revenues[i], 0);
        const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next 3 months
        const predictions = [];
        const lastEntry = monthlySales[monthlySales.length - 1];
        let predMonth = lastEntry._id.month;
        let predYear = lastEntry._id.year;

        for (let i = 0; i < 3; i++) {
            predMonth++;
            if (predMonth > 12) { predMonth = 1; predYear++; }
            const predicted = Math.max(0, Math.round(intercept + slope * (n + i)));
            // Add seasonal adjustment (±10%)
            const seasonFactor = 1 + (Math.sin((predMonth - 1) * Math.PI / 6) * 0.1);
            predictions.push({
                _id: { year: predYear, month: predMonth },
                revenue: Math.round(predicted * seasonFactor),
                predicted: true
            });
        }

        // Moving average (3-month)
        const movingAvg = [];
        for (let i = 2; i < revenues.length; i++) {
            movingAvg.push({
                month: monthlySales[i]._id,
                avg: Math.round((revenues[i] + revenues[i - 1] + revenues[i - 2]) / 3)
            });
        }

        const trend = slope > 0 ? 'growing' : slope < -100 ? 'declining' : 'stable';
        const growthRate = n > 1 ? ((revenues[n - 1] - revenues[0]) / revenues[0] * 100).toFixed(1) : 0;

        res.json({
            historical: monthlySales,
            predictions,
            movingAvg,
            trend,
            growthRate,
            avgMonthlyRevenue: Math.round(sumY / n),
            slope: Math.round(slope),
            totalDataPoints: n
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
