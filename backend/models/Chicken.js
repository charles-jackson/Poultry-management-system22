const mongoose = require('mongoose');

const chickenSchema = new mongoose.Schema(
  {
    breed: {
      type: String,
      required: [true, 'Please specify the chicken breed'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify the quantity'],
      min: 0,
    },
    age: {
      type: String,
      required: [true, 'Please specify the age (e.g., 4 weeks, 2 months)'],
    },
    gender: {
      type: String,
      enum: ['Hen', 'Rooster', 'Mixed', 'Chick'],
      default: 'Hen',
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Sick', 'Vaccinated', 'Quarantine', 'Under Treatment'],
      default: 'Healthy',
    },
    source: {
      type: String,
      enum: ['Available in Farm', 'Brought from Outside'],
      default: 'Available in Farm',
    },
    supplier: {
      type: String,
      default: '',
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Please specify the date'],
      default: Date.now,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chicken', chickenSchema);
