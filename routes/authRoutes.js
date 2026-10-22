const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateRole, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/role', protect, updateRole);
router.get('/me', protect, getMe);

module.exports = router;
