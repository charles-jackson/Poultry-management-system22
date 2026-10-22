const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    breed: {
      type: String,
      required: [true, 'Please specify chicken or breed'],
      trim: true,
    },
    vaccineName: {
      type: String,
      required: [true, 'Please specify vaccine name'],
      trim: true,
    },
    vaccinationDate: {
      type: Date,
      required: [true, 'Please specify vaccination date'],
      default: Date.now,
    },
    nextVaccinationDate: {
      type: Date,
      required: [true, 'Please specify next vaccination date'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify dose / quantity'],
      min: 1,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
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

module.exports = mongoose.model('Vaccination', vaccinationSchema);
