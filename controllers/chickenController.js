const Chicken = require('../models/Chicken');

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
    const { breed, quantity, age, gender, healthStatus, purchaseDate, price } = req.body;
    const chicken = new Chicken({
      breed,
      quantity,
      age,
      gender,
      healthStatus,
      purchaseDate,
      price,
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
    if (chicken) {
      chicken.breed = req.body.breed || chicken.breed;
      chicken.quantity = req.body.quantity !== undefined ? req.body.quantity : chicken.quantity;
      chicken.age = req.body.age || chicken.age;
      chicken.gender = req.body.gender || chicken.gender;
      chicken.healthStatus = req.body.healthStatus || chicken.healthStatus;
      chicken.purchaseDate = req.body.purchaseDate || chicken.purchaseDate;
      chicken.price = req.body.price !== undefined ? req.body.price : chicken.price;

      const updatedChicken = await chicken.save();
      res.json(updatedChicken);
    } else {
      res.status(404).json({ message: 'Chicken record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a chicken record
const deleteChicken = async (req, res) => {
  try {
    const chicken = await Chicken.findById(req.params.id);
    if (chicken) {
      await chicken.deleteOne();
      res.json({ message: 'Chicken record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chicken record not found' });
    }
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
