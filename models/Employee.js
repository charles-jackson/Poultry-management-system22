const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, 'Please specify employee name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please specify phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please specify address'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    jobRole: {
      type: String,
      required: [true, 'Please specify job role'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Please specify joining date'],
      default: Date.now,
    },
    salary: {
      type: Number,
      required: [true, 'Please specify salary'],
      min: 0,
    },
    attendance: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave', 'Half Day'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
