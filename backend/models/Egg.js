const mongoose = require('mongoose');

const eggSchema = new mongoose.Schema(
  {
    breed: {
      type: String,
      required: [true, 'Please specify chicken breed'],
      trim: true,
    },
    productionDate: {
      type: Date,
      required: [true, 'Please specify production date'],
      default: Date.now,
    },
    totalEggs: {
      type: Number,
      required: [true, 'Please specify total eggs'],
      min: 0,
    },
    brokenEggs: {
      type: Number,
      required: [true, 'Please specify broken eggs'],
      min: 0,
      validate: {
        validator: function (val) {
          return val <= this.totalEggs;
        },
        message: 'Broken eggs cannot be greater than total eggs',
      },
    },
    goodEggs: {
      type: Number,
      default: 0,
    },
    soldEggs: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceEggs: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricePerEgg: {
      type: Number,
      required: [true, 'Please specify price per egg'],
      min: 0,
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

eggSchema.pre('save', function (next) {
  if (this.brokenEggs > this.totalEggs) {
    return next(new Error('Broken eggs cannot be greater than total eggs'));
  }
  this.goodEggs = this.totalEggs - this.brokenEggs;
  if (this.soldEggs === undefined || this.soldEggs === null) {
    this.soldEggs = 0;
  }
  this.balanceEggs = Math.max(0, this.goodEggs - this.soldEggs);
  this.totalAmount = this.goodEggs * this.pricePerEgg;
  next();
});

module.exports = mongoose.model('Egg', eggSchema);
