const express = require('express');
const router = express.Router();
const {
  getVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
} = require('../controllers/vaccinationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getVaccinations)
  .post(protect, createVaccination);

router.route('/:id')
  .put(protect, updateVaccination)
  .delete(protect, deleteVaccination);

module.exports = router;
