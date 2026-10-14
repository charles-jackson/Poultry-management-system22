const express = require('express');
const router = express.Router();
const {
  getFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
} = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFeeds)
  .post(protect, createFeed);

router.route('/:id')
  .put(protect, updateFeed)
  .delete(protect, deleteFeed);

module.exports = router;
