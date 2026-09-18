const Vaccination = require('../models/Vaccination');

// Get all vaccination records
const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find().sort({ vaccinationDate: -1 });
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create vaccination record
const createVaccination = async (req, res) => {
  try {
    const { breed, vaccineName, vaccinationDate, nextVaccinationDate, quantity, remarks } = req.body;
    const vaccination = new Vaccination({
      breed,
      vaccineName,
      vaccinationDate,
      nextVaccinationDate,
      quantity,
      remarks,
    });
    const createdVaccination = await vaccination.save();
    res.status(201).json(createdVaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update vaccination record
const updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (vaccination) {
      vaccination.breed = req.body.breed || vaccination.breed;
      vaccination.vaccineName = req.body.vaccineName || vaccination.vaccineName;
      vaccination.vaccinationDate = req.body.vaccinationDate || vaccination.vaccinationDate;
      vaccination.nextVaccinationDate = req.body.nextVaccinationDate || vaccination.nextVaccinationDate;
      vaccination.quantity = req.body.quantity !== undefined ? req.body.quantity : vaccination.quantity;
      vaccination.remarks = req.body.remarks !== undefined ? req.body.remarks : vaccination.remarks;

      const updatedVaccination = await vaccination.save();
      res.json(updatedVaccination);
    } else {
      res.status(404).json({ message: 'Vaccination record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete vaccination record
const deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (vaccination) {
      await vaccination.deleteOne();
      res.json({ message: 'Vaccination record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Vaccination record not found' });
    }
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
