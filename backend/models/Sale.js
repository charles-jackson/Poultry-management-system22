const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      enum: ['Chicken', 'Eggs', 'Other'],
      default: 'Chicken',
    },
    product: {
      type: String,
      required: [true, 'Please specify product name'],
      trim: true,
    },
    chickenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chicken',
      default: null,
    },
    eggId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Egg',
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: 1,
    },
    deductedQuantity: {
      type: Number,
      default: 0,
    },
    remainingStockBalance: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per unit'],
      min: 0,
    },
    customerName: {
      type: String,
      required: [true, 'Please specify customer name'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify sale date'],
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.price;
  if (this.amountPaid === undefined || this.amountPaid === null || this.amountPaid === 0) {
    this.amountPaid = this.totalAmount;
  }
  this.paymentBalance = Math.max(0, this.totalAmount - this.amountPaid);
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
