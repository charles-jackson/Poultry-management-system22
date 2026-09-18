const Egg = require('../models/Egg');

// Get all egg records
const getEggs = async (req, res) => {
  try {
    const eggs = await Egg.find().sort({ productionDate: -1 });
    res.json(eggs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create egg record
const createEgg = async (req, res) => {
  try {
    const { breed, productionDate, totalEggs, brokenEggs, pricePerEgg } = req.body;

    if (Number(brokenEggs) > Number(totalEggs)) {
      return res.status(400).json({ message: 'Broken eggs cannot be greater than total eggs' });
    }

    const egg = new Egg({
      breed,
      productionDate,
      totalEggs,
      brokenEggs,
      pricePerEgg,
    });
    const createdEgg = await egg.save();
    res.status(201).json(createdEgg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update egg record
const updateEgg = async (req, res) => {
  try {
    const egg = await Egg.findById(req.params.id);
    if (egg) {
      const newTotal = req.body.totalEggs !== undefined ? Number(req.body.totalEggs) : egg.totalEggs;
      const newBroken = req.body.brokenEggs !== undefined ? Number(req.body.brokenEggs) : egg.brokenEggs;

      if (newBroken > newTotal) {
        return res.status(400).json({ message: 'Broken eggs cannot be greater than total eggs' });
      }

      egg.breed = req.body.breed || egg.breed;
      egg.productionDate = req.body.productionDate || egg.productionDate;
      egg.totalEggs = newTotal;
      egg.brokenEggs = newBroken;
      egg.pricePerEgg = req.body.pricePerEgg !== undefined ? req.body.pricePerEgg : egg.pricePerEgg;

      const updatedEgg = await egg.save();
      res.json(updatedEgg);
    } else {
      res.status(404).json({ message: 'Egg record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete egg record
const deleteEgg = async (req, res) => {
  try {
    const egg = await Egg.findById(req.params.id);
    if (egg) {
      await egg.deleteOne();
      res.json({ message: 'Egg record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Egg record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEggs,
  createEgg,
  updateEgg,
  deleteEgg,
};
