const Feed = require('../models/Feed');

// Get all feed records
const getFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ date: -1 });
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create feed record
const createFeed = async (req, res) => {
  try {
    const { feedName, feedType, quantity, unit, price, supplier, date } = req.body;
    const feed = new Feed({
      feedName,
      feedType,
      quantity,
      unit,
      price,
      supplier,
      date,
    });
    const createdFeed = await feed.save();
    res.status(201).json(createdFeed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update feed record
const updateFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (feed) {
      feed.feedName = req.body.feedName || feed.feedName;
      feed.feedType = req.body.feedType || feed.feedType;
      feed.quantity = req.body.quantity !== undefined ? req.body.quantity : feed.quantity;
      feed.unit = req.body.unit || feed.unit;
      feed.price = req.body.price !== undefined ? req.body.price : feed.price;
      feed.supplier = req.body.supplier || feed.supplier;
      feed.date = req.body.date || feed.date;

      const updatedFeed = await feed.save();
      res.json(updatedFeed);
    } else {
      res.status(404).json({ message: 'Feed record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete feed record
const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (feed) {
      await feed.deleteOne();
      res.json({ message: 'Feed record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Feed record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
};
