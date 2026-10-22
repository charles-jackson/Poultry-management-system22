const Feed = require('../models/Feed');
const Expense = require('../models/Expense');

// Get all feed records
const getFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ date: -1 });
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create feed record and auto-add expense to Expense Management
const createFeed = async (req, res) => {
  try {
    const { feedName, feedType, quantity, unit, price, supplier, date } = req.body;
    const qty = Number(quantity) || 0;
    const unitPrice = Number(price) || 0;
    const totalCost = qty * unitPrice;
    let linkedExpenseId = null;

    // Automatically record in Expense Management if cost > 0
    if (totalCost > 0) {
      const expense = await Expense.create({
        category: 'Feed Purchase',
        description: `Purchased ${qty} ${unit || 'Kg'} of ${feedName} (${feedType})${
          supplier ? ` from ${supplier}` : ''
        }`,
        amount: totalCost,
        date: date || new Date(),
        remarks: `Auto-recorded from Feed Inventory ($${unitPrice}/${unit || 'Kg'})`,
      });
      linkedExpenseId = expense._id;
    }

    const feed = new Feed({
      feedName,
      feedType,
      quantity: qty,
      unit,
      price: unitPrice,
      supplier,
      date: date || new Date(),
      totalCost,
      expenseId: linkedExpenseId,
    });

    const createdFeed = await feed.save();
    res.status(201).json(createdFeed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update feed record and sync linked expense
const updateFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed record not found' });
    }

    feed.feedName = req.body.feedName || feed.feedName;
    feed.feedType = req.body.feedType || feed.feedType;
    feed.quantity = req.body.quantity !== undefined ? Number(req.body.quantity) : feed.quantity;
    feed.unit = req.body.unit || feed.unit;
    feed.price = req.body.price !== undefined ? Number(req.body.price) : feed.price;
    feed.supplier = req.body.supplier || feed.supplier;
    feed.date = req.body.date || feed.date;
    feed.totalCost = feed.quantity * feed.price;

    // Sync linked expense
    if (feed.totalCost > 0) {
      if (feed.expenseId) {
        await Expense.findByIdAndUpdate(feed.expenseId, {
          category: 'Feed Purchase',
          description: `Purchased ${feed.quantity} ${feed.unit || 'Kg'} of ${feed.feedName} (${feed.feedType})${
            feed.supplier ? ` from ${feed.supplier}` : ''
          }`,
          amount: feed.totalCost,
          date: feed.date,
          remarks: `Auto-recorded from Feed Inventory ($${feed.price}/${feed.unit || 'Kg'})`,
        });
      } else {
        const expense = await Expense.create({
          category: 'Feed Purchase',
          description: `Purchased ${feed.quantity} ${feed.unit || 'Kg'} of ${feed.feedName} (${feed.feedType})${
            feed.supplier ? ` from ${feed.supplier}` : ''
          }`,
          amount: feed.totalCost,
          date: feed.date,
          remarks: `Auto-recorded from Feed Inventory ($${feed.price}/${feed.unit || 'Kg'})`,
        });
        feed.expenseId = expense._id;
      }
    } else if (feed.expenseId) {
      await Expense.findByIdAndDelete(feed.expenseId);
      feed.expenseId = null;
    }

    const updatedFeed = await feed.save();
    res.json(updatedFeed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete feed record and remove linked expense
const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed record not found' });
    }

    if (feed.expenseId) {
      await Expense.findByIdAndDelete(feed.expenseId);
    }

    await feed.deleteOne();
    res.json({ message: 'Feed record and linked expense deleted successfully' });
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
