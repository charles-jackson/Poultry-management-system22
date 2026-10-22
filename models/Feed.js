const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema(
  {
    feedName: {
      type: String,
      required: [true, 'Please specify feed name'],
      trim: true,
    },
    feedType: {
      type: String,
      enum: ['Starter Feed', 'Grower Feed', 'Layer Feed', 'Broiler Feed', 'Finisher Feed', 'Other'],
      required: [true, 'Please specify feed type'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['Kg', 'Bags', 'Ton', 'Grams'],
      default: 'Kg',
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per unit'],
      min: 0,
    },
    supplier: {
      type: String,
      required: [true, 'Please specify supplier name'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify date'],
      default: Date.now,
    },
    totalCost: {
      type: Number,
      default: 0,
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

feedSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.price;
  next();
});

module.exports = mongoose.model('Feed', feedSchema);
