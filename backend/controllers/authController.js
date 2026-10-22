const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'poultry_farm_secret_jwt_key_2026_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is not connected. Please verify the MONGO_URI environment variable on Render / Server.'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const assignedRole = role === 'Admin' ? 'Admin' : 'User';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, loginRole } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is not connected. Please verify the MONGO_URI environment variable on Render / Server.'
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Determine the session role based on user selection:
      // If user selected 'User' (Staff) tab, activeRole is 'User'.
      // If user selected 'Admin' tab, activeRole is 'Admin'.
      const activeRole = loginRole ? loginRole : (user.role || 'User');

      // Update role in DB if different so future calls stay aligned
      if (loginRole && user.role !== loginRole) {
        user.role = loginRole;
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: activeRole,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
