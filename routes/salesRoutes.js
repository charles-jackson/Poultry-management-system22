const express = require('express');
const router = express.Router();
const {
  getSales,
  createSale,
  updateSale,
  deleteSale,
} = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.route('/:id')
  .put(protect, updateSale)
  .delete(protect, deleteSale);

module.exports = router;
