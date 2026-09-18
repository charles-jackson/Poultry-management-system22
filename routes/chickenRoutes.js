const express = require('express');
const router = express.Router();
const {
  getChickens,
  createChicken,
  updateChicken,
  deleteChicken,
} = require('../controllers/chickenController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getChickens)
  .post(protect, createChicken);

router.route('/:id')
  .put(protect, updateChicken)
  .delete(protect, deleteChicken);

module.exports = router;
