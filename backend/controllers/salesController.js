const Sale = require('../models/Sale');

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create sale record
const createSale = async (req, res) => {
  try {
    const { product, quantity, price, customerName, date } = req.body;
    const sale = new Sale({
      product,
      quantity,
      price,
      customerName,
      date,
    });
    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update sale record
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) {
      sale.product = req.body.product || sale.product;
      sale.quantity = req.body.quantity !== undefined ? req.body.quantity : sale.quantity;
      sale.price = req.body.price !== undefined ? req.body.price : sale.price;
      sale.customerName = req.body.customerName || sale.customerName;
      sale.date = req.body.date || sale.date;

      const updatedSale = await sale.save();
      res.json(updatedSale);
    } else {
      res.status(404).json({ message: 'Sale record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete sale record
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) {
      await sale.deleteOne();
      res.json({ message: 'Sale record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sale record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
};
