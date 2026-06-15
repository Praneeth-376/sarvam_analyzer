const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET all users (master: all, admin: branch workers only)
router.get('/', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'admin') {
            filter = { branchId: req.user.branchId, role: 'worker' };
        }
        if (req.query.role) filter.role = req.query.role;
        if (req.query.branchId) filter.branchId = req.query.branchId;

        const users = await User.find(filter)
            .select('-password')
            .populate('branchId', 'name location')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create user — hierarchy: master creates admins/workers, admin creates workers
router.post('/', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const { name, email, password, role, branchId, salesTarget } = req.body;

        // Enforce hierarchy
        if (req.user.role === 'admin') {
            if (role !== 'worker') {
                return res.status(403).json({ msg: 'Admins can only create workers' });
            }
        }
        if (req.user.role === 'master') {
            if (role === 'master') {
                return res.status(403).json({ msg: 'Cannot create another master' });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'User with this email already exists' });

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        // Admin creating worker → auto-assign their branch
        const assignedBranch = req.user.role === 'admin' ? req.user.branchId : branchId;

        const user = new User({
            name,
            email,
            password,
            role: role || 'worker',
            branchId: assignedBranch,
            salesTarget: salesTarget || 0
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const result = await User.findById(user._id).select('-password').populate('branchId', 'name location');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update user
router.put('/:id', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.password;

        // Admin can only update workers in their branch
        if (req.user.role === 'admin') {
            const target = await User.findById(req.params.id);
            if (!target) return res.status(404).json({ msg: 'User not found' });
            if (target.role !== 'worker' || target.branchId?.toString() !== req.user.branchId) {
                return res.status(403).json({ msg: 'You can only update workers in your branch' });
            }
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
            .select('-password')
            .populate('branchId', 'name location');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT toggle active status
router.put('/:id/toggle-active', auth, authorize('master', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Admin can only toggle workers in their branch
        if (req.user.role === 'admin') {
            if (user.role !== 'worker' || user.branchId?.toString() !== req.user.branchId) {
                return res.status(403).json({ msg: 'You can only manage workers in your branch' });
            }
        }

        user.isActive = !user.isActive;
        await user.save();
        res.json({ isActive: user.isActive, _id: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE user (master only)
router.delete('/:id', auth, authorize('master'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'master') return res.status(403).json({ msg: 'Cannot delete master account' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted', _id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
