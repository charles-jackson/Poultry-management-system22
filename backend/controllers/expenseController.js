const Expense = require('../models/Expense');

// Get all expense records
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create expense record
const createExpense = async (req, res) => {
  try {
    const { category, description, amount, date, remarks } = req.body;
    const expense = new Expense({
      category,
      description,
      amount,
      date,
      remarks,
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update expense record
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      expense.category = req.body.category || expense.category;
      expense.description = req.body.description || expense.description;
      expense.amount = req.body.amount !== undefined ? req.body.amount : expense.amount;
      expense.date = req.body.date || expense.date;
      expense.remarks = req.body.remarks !== undefined ? req.body.remarks : expense.remarks;

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete expense record
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
      await expense.deleteOne();
      res.json({ message: 'Expense record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Expense record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
