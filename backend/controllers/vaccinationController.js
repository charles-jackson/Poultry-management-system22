const Vaccination = require('../models/Vaccination');
const Expense = require('../models/Expense');

// Get all vaccination records
const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find().sort({ vaccinationDate: -1 });
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create vaccination record and auto-add expense to Expense Management
const createVaccination = async (req, res) => {
  try {
    const {
      breed,
      vaccineName,
      vaccinationDate,
      nextVaccinationDate,
      quantity,
      cost,
      remarks,
    } = req.body;

    const vaccineCost = Number(cost) || 0;
    let linkedExpenseId = null;

    // Automatically record in Expense Management if cost > 0
    if (vaccineCost > 0) {
      const expense = await Expense.create({
        category: 'Vaccination & Medicine',
        description: `Vaccination: ${vaccineName} for ${breed} (${quantity} doses)`,
        amount: vaccineCost,
        date: vaccinationDate || new Date(),
        remarks: remarks || `Auto-recorded from Vaccination Management`,
      });
      linkedExpenseId = expense._id;
    }

    const vaccination = new Vaccination({
      breed,
      vaccineName,
      vaccinationDate: vaccinationDate || new Date(),
      nextVaccinationDate,
      quantity,
      cost: vaccineCost,
      expenseId: linkedExpenseId,
      remarks: remarks || '',
    });

    const createdVaccination = await vaccination.save();
    res.status(201).json(createdVaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update vaccination record and sync linked expense
const updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }

    vaccination.breed = req.body.breed || vaccination.breed;
    vaccination.vaccineName = req.body.vaccineName || vaccination.vaccineName;
    vaccination.vaccinationDate = req.body.vaccinationDate || vaccination.vaccinationDate;
    vaccination.nextVaccinationDate = req.body.nextVaccinationDate || vaccination.nextVaccinationDate;
    vaccination.quantity = req.body.quantity !== undefined ? req.body.quantity : vaccination.quantity;
    vaccination.cost = req.body.cost !== undefined ? Number(req.body.cost) : vaccination.cost;
    vaccination.remarks = req.body.remarks !== undefined ? req.body.remarks : vaccination.remarks;

    // Sync linked expense
    if (vaccination.cost > 0) {
      if (vaccination.expenseId) {
        await Expense.findByIdAndUpdate(vaccination.expenseId, {
          category: 'Vaccination & Medicine',
          description: `Vaccination: ${vaccination.vaccineName} for ${vaccination.breed} (${vaccination.quantity} doses)`,
          amount: vaccination.cost,
          date: vaccination.vaccinationDate,
          remarks: vaccination.remarks || `Auto-recorded from Vaccination Management`,
        });
      } else {
        const expense = await Expense.create({
          category: 'Vaccination & Medicine',
          description: `Vaccination: ${vaccination.vaccineName} for ${vaccination.breed} (${vaccination.quantity} doses)`,
          amount: vaccination.cost,
          date: vaccination.vaccinationDate,
          remarks: vaccination.remarks || `Auto-recorded from Vaccination Management`,
        });
        vaccination.expenseId = expense._id;
      }
    } else if (vaccination.expenseId) {
      await Expense.findByIdAndDelete(vaccination.expenseId);
      vaccination.expenseId = null;
    }

    const updatedVaccination = await vaccination.save();
    res.json(updatedVaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vaccination record and remove linked expense
const deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }

    if (vaccination.expenseId) {
      await Expense.findByIdAndDelete(vaccination.expenseId);
    }

    await vaccination.deleteOne();
    res.json({ message: 'Vaccination record and linked expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
};
