const Chicken = require('../models/Chicken');
const Expense = require('../models/Expense');

// Get all chickens
const getChickens = async (req, res) => {
  try {
    const chickens = await Chicken.find().sort({ createdAt: -1 });
    res.json(chickens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a chicken record
const createChicken = async (req, res) => {
  try {
    const {
      breed,
      quantity,
      age,
      gender,
      healthStatus,
      source,
      supplier,
      purchaseDate,
      price,
    } = req.body;

    const chickenSource = source || 'Available in Farm';
    const chickenPrice = Number(price) || 0;
    const chickenQty = Number(quantity) || 1;
    let linkedExpenseId = null;

    // If chickens are brought from outside, automatically add expense to Expense Management
    if (chickenSource === 'Brought from Outside') {
      const totalCost = chickenPrice * chickenQty;
      if (totalCost > 0) {
        const expense = await Expense.create({
          category: 'Chicken Purchase',
          description: `Brought from outside: ${chickenQty} ${breed} chickens (${gender || 'Mixed'})${
            supplier ? ` from ${supplier}` : ''
          }`,
          amount: totalCost,
          date: purchaseDate || new Date(),
          remarks: `Auto-recorded from Chicken Flock purchase ($${chickenPrice}/unit)`,
        });
        linkedExpenseId = expense._id;
      }
    }

    const chicken = new Chicken({
      breed,
      quantity: chickenQty,
      age,
      gender,
      healthStatus,
      source: chickenSource,
      supplier: supplier || '',
      purchaseDate: purchaseDate || new Date(),
      price: chickenPrice,
      expenseId: linkedExpenseId,
    });

    const createdChicken = await chicken.save();
    res.status(201).json(createdChicken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a chicken record
const updateChicken = async (req, res) => {
  try {
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return res.status(404).json({ message: 'Chicken record not found' });
    }

    chicken.breed = req.body.breed || chicken.breed;
    chicken.quantity = req.body.quantity !== undefined ? Number(req.body.quantity) : chicken.quantity;
    chicken.age = req.body.age || chicken.age;
    chicken.gender = req.body.gender || chicken.gender;
    chicken.healthStatus = req.body.healthStatus || chicken.healthStatus;
    chicken.source = req.body.source || chicken.source || 'Available in Farm';
    chicken.supplier = req.body.supplier !== undefined ? req.body.supplier : chicken.supplier;
    chicken.purchaseDate = req.body.purchaseDate || chicken.purchaseDate;
    chicken.price = req.body.price !== undefined ? Number(req.body.price) : chicken.price;

    const totalCost = (chicken.price || 0) * (chicken.quantity || 1);

    if (chicken.source === 'Brought from Outside') {
      if (totalCost > 0) {
        if (chicken.expenseId) {
          // Update existing expense
          await Expense.findByIdAndUpdate(chicken.expenseId, {
            category: 'Chicken Purchase',
            description: `Brought from outside: ${chicken.quantity} ${chicken.breed} chickens (${chicken.gender || 'Mixed'})${
              chicken.supplier ? ` from ${chicken.supplier}` : ''
            }`,
            amount: totalCost,
            date: chicken.purchaseDate,
            remarks: `Auto-recorded from Chicken Flock purchase ($${chicken.price}/unit)`,
          });
        } else {
          // Create new expense
          const expense = await Expense.create({
            category: 'Chicken Purchase',
            description: `Brought from outside: ${chicken.quantity} ${chicken.breed} chickens (${chicken.gender || 'Mixed'})${
              chicken.supplier ? ` from ${chicken.supplier}` : ''
            }`,
            amount: totalCost,
            date: chicken.purchaseDate,
            remarks: `Auto-recorded from Chicken Flock purchase ($${chicken.price}/unit)`,
          });
          chicken.expenseId = expense._id;
        }
      }
    } else {
      // Changed back to Available in Farm - remove linked expense if it existed
      if (chicken.expenseId) {
        await Expense.findByIdAndDelete(chicken.expenseId);
        chicken.expenseId = null;
      }
    }

    const updatedChicken = await chicken.save();
    res.json(updatedChicken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a chicken record
const deleteChicken = async (req, res) => {
  try {
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return res.status(404).json({ message: 'Chicken record not found' });
    }

    // Delete linked expense if created for this chicken
    if (chicken.expenseId) {
      await Expense.findByIdAndDelete(chicken.expenseId);
    }

    await chicken.deleteOne();
    res.json({ message: 'Chicken record and associated expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChickens,
  createChicken,
  updateChicken,
  deleteChicken,
};
