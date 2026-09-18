const Chicken = require('../models/Chicken');
const Feed = require('../models/Feed');
const Egg = require('../models/Egg');
const Employee = require('../models/Employee');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Vaccination = require('../models/Vaccination');

// @desc    Get dashboard metrics & statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    // 1. Total Chickens
    const chickenAgg = await Chicken.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalChickens = chickenAgg.length > 0 ? chickenAgg[0].total : 0;

    // 2. Total Eggs Produced
    const eggAgg = await Egg.aggregate([
      { $group: { _id: null, total: { $sum: '$goodEggs' }, totalAll: { $sum: '$totalEggs' } } }
    ]);
    const totalEggs = eggAgg.length > 0 ? eggAgg[0].totalAll : 0;
    const goodEggsCount = eggAgg.length > 0 ? eggAgg[0].total : 0;

    // 3. Feed Stock Total (in Kg/Bags)
    const feedAgg = await Feed.aggregate([
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);
    const feedStock = feedAgg.length > 0 ? feedAgg[0].totalQty : 0;

    // 4. Employees Count
    const totalEmployees = await Employee.countDocuments();

    // 5. Total Sales
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = salesAgg.length > 0 ? salesAgg[0].total : 0;

    // 6. Total Expenses
    const expensesAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expensesAgg.length > 0 ? expensesAgg[0].total : 0;

    // 7. Net Profit
    const profit = totalSales - totalExpenses;

    // 8. Recent Activities (combining top entries from each entity)
    const recentChickens = await Chicken.find().sort({ createdAt: -1 }).limit(3);
    const recentEggs = await Egg.find().sort({ productionDate: -1 }).limit(3);
    const recentSales = await Sale.find().sort({ date: -1 }).limit(3);
    const recentExpenses = await Expense.find().sort({ date: -1 }).limit(3);
    const recentVaccinations = await Vaccination.find().sort({ vaccinationDate: -1 }).limit(3);

    const activities = [];

    recentChickens.forEach(c => {
      activities.push({
        id: c._id,
        type: 'Chicken',
        title: `Purchased ${c.quantity} ${c.breed} (${c.gender})`,
        date: c.purchaseDate || c.createdAt,
        status: c.healthStatus,
        badgeClass: 'bg-success'
      });
    });

    recentEggs.forEach(e => {
      activities.push({
        id: e._id,
        type: 'Egg Production',
        title: `${e.totalEggs} eggs collected (${e.goodEggs} good, ${e.brokenEggs} broken)`,
        date: e.productionDate || e.createdAt,
        status: `${e.breed}`,
        badgeClass: 'bg-primary'
      });
    });

    recentSales.forEach(s => {
      activities.push({
        id: s._id,
        type: 'Sale',
        title: `Sold ${s.quantity} x ${s.product} to ${s.customerName}`,
        date: s.date || s.createdAt,
        status: `$${s.totalAmount}`,
        badgeClass: 'bg-info'
      });
    });

    recentExpenses.forEach(ex => {
      activities.push({
        id: ex._id,
        type: 'Expense',
        title: `${ex.category}: ${ex.description}`,
        date: ex.date || ex.createdAt,
        status: `$${ex.amount}`,
        badgeClass: 'bg-danger'
      });
    });

    recentVaccinations.forEach(v => {
      activities.push({
        id: v._id,
        type: 'Vaccination',
        title: `Vaccinated ${v.breed} with ${v.vaccineName}`,
        date: v.vaccinationDate || v.createdAt,
        status: `Next: ${new Date(v.nextVaccinationDate).toLocaleDateString()}`,
        badgeClass: 'bg-warning text-dark'
      });
    });

    // Sort activities descending by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Expense breakdown by category
    const expenseByCategory = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    res.json({
      summary: {
        totalChickens,
        totalEggs,
        goodEggsCount,
        feedStock,
        totalEmployees,
        totalSales,
        totalExpenses,
        profit,
      },
      recentActivities: activities.slice(0, 8),
      expenseByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
};
