const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: [true, 'Please specify product'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: 1,
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
  },
  {
    timestamps: true,
  }
);

saleSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.price;
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
