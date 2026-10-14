const Employee = require('../models/Employee');

// Get all employee records
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create employee record
const createEmployee = async (req, res) => {
  try {
    const { employeeName, phone, address, gender, jobRole, joiningDate, salary, attendance } = req.body;
    const employee = new Employee({
      employeeName,
      phone,
      address,
      gender,
      jobRole,
      joiningDate,
      salary,
      attendance,
    });
    const createdEmployee = await employee.save();
    res.status(201).json(createdEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update employee record
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      employee.employeeName = req.body.employeeName || employee.employeeName;
      employee.phone = req.body.phone || employee.phone;
      employee.address = req.body.address || employee.address;
      employee.gender = req.body.gender || employee.gender;
      employee.jobRole = req.body.jobRole || employee.jobRole;
      employee.joiningDate = req.body.joiningDate || employee.joiningDate;
      employee.salary = req.body.salary !== undefined ? req.body.salary : employee.salary;
      employee.attendance = req.body.attendance || employee.attendance;

      const updatedEmployee = await employee.save();
      res.json(updatedEmployee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete employee record
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      await employee.deleteOne();
      res.json({ message: 'Employee record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
