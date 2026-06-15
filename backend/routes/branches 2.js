const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/authMiddleware');

// GET all branches (accessible to admin too for dropdown population)
router.get('/', auth, async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true })
            .populate('managerId', 'name email')
            .sort({ name: 1 });
        res.json(branches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create branch (master only)
router.post('/', auth, authorize('master'), async (req, res) => {
    try {
        const { name, location, managerId } = req.body;
        if (!name || !location) {
            return res.status(400).json({ msg: 'Branch name and location are required' });
        }

        const branch = new Branch({ name, location, managerId });
        await branch.save();

        // If manager assigned, update their branchId
        if (managerId) {
            await User.findByIdAndUpdate(managerId, { branchId: branch._id });
        }

        const populated = await Branch.findById(branch._id).populate('managerId', 'name email');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update branch (master only)
router.put('/:id', auth, authorize('master'), async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('managerId', 'name email');
        if (!branch) return res.status(404).json({ msg: 'Branch not found' });
        res.json(branch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE branch (soft delete, master only)
router.delete('/:id', auth, authorize('master'), async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!branch) return res.status(404).json({ msg: 'Branch not found' });
        res.json({ msg: 'Branch deleted', _id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
