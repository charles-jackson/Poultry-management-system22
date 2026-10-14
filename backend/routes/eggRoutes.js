const express = require('express');
const router = express.Router();
const {
  getEggs,
  createEgg,
  updateEgg,
  deleteEgg,
} = require('../controllers/eggController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getEggs)
  .post(protect, createEgg);

router.route('/:id')
  .put(protect, updateEgg)
  .delete(protect, deleteEgg);

module.exports = router;
