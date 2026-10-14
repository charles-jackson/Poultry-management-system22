const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/poultry_farm';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.MONGO_URI) {
      console.warn('WARNING: MONGO_URI is not set in environment variables! If running on Render, add MONGO_URI in your Render Dashboard.');
    }
  }
};

module.exports = connectDB;
