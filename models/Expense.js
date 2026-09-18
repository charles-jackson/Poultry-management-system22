const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please specify expense category'],
      enum: ['Feed Purchase', 'Vaccination & Medicine', 'Utilities & Water', 'Salaries', 'Equipment & Maintenance', 'Transport & Fuel', 'Other'],
      default: 'Feed Purchase',
    },
    description: {
      type: String,
      required: [true, 'Please specify description'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify amount'],
      min: 0,
    },
    date: {
      type: Date,
      required: [true, 'Please specify date'],
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
