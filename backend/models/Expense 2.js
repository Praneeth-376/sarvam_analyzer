const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    category: {
        type: String,
        enum: ['rent', 'salary', 'utilities', 'supplies', 'maintenance', 'marketing', 'other'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
