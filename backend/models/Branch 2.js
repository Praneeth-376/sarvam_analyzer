const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Branch', BranchSchema);
